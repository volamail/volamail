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

		sesNotificationsTopic.subscribe(
			"WebEmailNotificationsSubscriber",
			"functions/email-notifications-handler.handler",
		);

		const sesArn = await new Promise((resolve) => {
			email.nodes.identity.arn.apply((arn) => {
				resolve(arn.split("/")[0]);
			});
		});

		const bucket = new sst.aws.Bucket("Bucket");

		const databaseUrlSecret = new sst.Secret(
			"DatabaseUrl",
			process.env.DATABASE_URL!,
		);

		const githubClientSecret = new sst.Secret(
			"GithubClientSecret",
			process.env.GITHUB_CLIENT_SECRET!,
		);

		new sst.aws.TanstackStart("Web", {
			link: [
				email,
				bucket,
				sesNotificationsTopic,
				databaseUrlSecret,
				githubClientSecret,
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
	},
});
