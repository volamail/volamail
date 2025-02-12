import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { getSesV2Client } from "./clients";

export async function sendEmail(options: {
	from: {
		address: string;
		label: string;
	};
	to: string;
	subject: string;
	html: string;
	text: string;
	data?: Record<string, string>;
}) {
	const client = getSesV2Client();

	const variables = options.data || {};

	const subject = insertVariablesInString(options.subject, variables);
	const html = insertVariablesInString(options.html, variables);
	const text = insertVariablesInString(options.text, variables);

	return await client.send(
		new SendEmailCommand({
			FromEmailAddress: `${options.from.label} <${options.from.address}>`,
			Destination: {
				ToAddresses: [options.to],
			},
			Content: {
				Simple: {
					Subject: {
						Data: subject,
					},
					Body: {
						Html: {
							Data: html,
						},
						Text: {
							Data: text,
						},
					},
				},
			},
		}),
	);
}

function insertVariablesInString(
	target: string,
	variables: Record<string, string>,
) {
	return target.replace(/{{\s*([^}\s]+)\s*}}/g, (match, key) => {
		return variables[key] || match;
	});
}
