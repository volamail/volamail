/// <reference path="./.sst/platform/config.d.ts" />

import { clientEnv } from "@/modules/environment/client";
import { serverEnv } from "@/modules/environment/server";

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
			sender: serverEnv.NOREPLY_EMAIL,
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

		new sst.aws.TanstackStart("Web", {
			link: [email, bucket, sesNotificationsTopic],
			domain: $dev
				? undefined
				: {
						dns: false,
						name: serverEnv.DOMAIN,
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
				DOMAIN: serverEnv.DOMAIN,
				DATABASE_URL: serverEnv.DATABASE_URL,
				GITHUB_CLIENT_ID: serverEnv.GITHUB_CLIENT_ID,
				GITHUB_CLIENT_SECRET: serverEnv.GITHUB_CLIENT_SECRET,
				SELF_HOSTED: serverEnv.SELF_HOSTED,
				NOREPLY_EMAIL: serverEnv.NOREPLY_EMAIL,
				VITE_SUPPORT_EMAIL: clientEnv.VITE_SUPPORT_EMAIL,
			},
		});

		new sst.x.DevCommand("Studio", {
			environment: {
				DATABASE_URL: serverEnv.DATABASE_URL,
			},
			dev: {
				command: "bun db studio",
			},
		});
	},
});
