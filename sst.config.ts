/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "volamail",
			removal: input?.stage === "production" ? "retain" : "remove",
			home: "aws",
			providers: {
				aws: {
					region: "eu-central-1",
				},
			},
		};
	},
	async run() {
		const sesNotificationsTopic = new sst.aws.SnsTopic(
			"EmailNotificationsTopic",
		);

		const bucket = new sst.aws.Bucket("Bucket");

		const databaseUrlSecret = new sst.Secret(
			"DatabaseUrl",
			process.env.DATABASE_URL!,
		);

		// TODO: Make this friendlier for self-hosting
		const email = new sst.aws.Email("Email", {
			sender: process.env.VITE_NOREPLY_EMAIL!,
			events: [
				{
					name: "DeliveryNotification",
					types: ["delivery", "bounce", "complaint"],
					topic: sesNotificationsTopic.arn,
				},
			],
		});

		const githubClientSecret = new sst.Secret(
			"GithubClientSecret",
			process.env.GITHUB_CLIENT_SECRET!,
		);

		const stripeSecretKey = new sst.Secret(
			"StripeSecretKey",
			process.env.STRIPE_SECRET_KEY!,
		);

		const stripeWebhookSecret = new sst.Secret(
			"StripeWebhookSecret",
			process.env.STRIPE_WEBHOOK_SECRET!,
		);

		sesNotificationsTopic.subscribe("WebEmailNotificationsSubscriber", {
			handler: "functions/email-notifications-handler.handler",
			link: [databaseUrlSecret],
		});

		const sesArn = await new Promise((resolve) => {
			email.nodes.identity.arn.apply((arn) => {
				resolve(arn.split("/")[0]);
			});
		});

		new sst.aws.TanstackStart("Web", {
			server: {
				runtime: "nodejs22.x",
			},
			link: [
				email,
				bucket,
				sesNotificationsTopic,
				databaseUrlSecret,
				githubClientSecret,
				stripeSecretKey,
				stripeWebhookSecret,
			],
			domain: $dev
				? undefined
				: {
						dns: false,
						name: process.env.VITE_DOMAIN!,
						cert: process.env.ACM_CERTIFICATE_ARN,
					},
			permissions: [
				{
					actions: ["ses:*"],
					resources: [`${sesArn}/*`],
				},
				{
					actions: ["ses:SetIdentityNotificationTopic"],
					resources: ["*"],
				},
			],
			environment: {
				VITE_DOMAIN: process.env.VITE_DOMAIN!,
				VITE_SELF_HOSTED: process.env.VITE_SELF_HOSTED!,
				VITE_NOREPLY_EMAIL: process.env.VITE_NOREPLY_EMAIL!,
				VITE_SUPPORT_EMAIL: process.env.VITE_SUPPORT_EMAIL!,
				VITE_GITHUB_CLIENT_ID: process.env.VITE_GITHUB_CLIENT_ID!,
				VITE_STRIPE_PRO_PLAN_PRICE_ID:
					process.env.VITE_STRIPE_PRO_PLAN_PRICE_ID!,
			},
		});

		new sst.x.DevCommand("Studio", {
			environment: {
				DATABASE_URL: process.env.DATABASE_URL!,
			},
			dev: {
				command: "bun db studio",
			},
		});

		new sst.x.DevCommand("Stripe", {
			dev: {
				command:
					"stripe listen --forward-to localhost:3000/api/internal/stripe/webhook",
			},
		});

		return undefined;
	},
});
