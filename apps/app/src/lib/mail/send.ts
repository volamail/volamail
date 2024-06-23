import { SESv2, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { env } from "../env";

type Params = {
  body: string;
  subject: string;
  from: string;
  to: string | string[];
  data: Record<string, string>;
};

export const sesClient = new SESv2({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendMail(params: Params) {
  const { subject, body } = params;

  const html = body.replace(
    /(\{\{.+?\}\})/g,
    (match) => params.data[match.slice(2, -2)]
  );

  const subjectText = subject.replace(
    /(\{\{.+?\}\})/g,
    (match) => params.data[match.slice(2, -2)]
  );

  await sesClient.send(
    new SendEmailCommand({
      FromEmailAddress: params.from,
      Destination: {
        ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: subjectText,
          },
          Body: {
            Html: {
              Data: `<head><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>${html}`,
            },
          },
        },
      },
    })
  );
}
