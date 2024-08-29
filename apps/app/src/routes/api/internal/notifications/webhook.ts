import * as v from "valibot";
import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import Validator from 'sns-payload-validator';
import { APIEvent } from "@solidjs/start/server";

import { db } from "~/lib/db";
import { env } from "~/lib/environment/env";
import { emailsTable } from "~/lib/db/schema";

/**
 * This endpoint is called by the Amazon SNS webhook
 * to notify us of email events (from Amazon SES).
 * This is used to update the delivery status of
 * emails in the database..
 */
export async function POST({ request }: APIEvent) {
  if (!env.AWS_SNS_TOPIC_ARN) {
    return new Response("Not configured", { status: 404 });
  }

  const body = await request.json();

  const payload = await v.safeParseAsync(
    v.object({
      Type: v.literal("Notification"),
      Signature: v.string(),
      SigningCertURL: v.string(),
      SignatureVersion: v.literal("1"),
      TopicArn: v.string(),
      Message: v.string(),
      MessageId: v.string(),
      Timestamp: v.string(),
    }),
    body
  );

  if (!payload.success || (payload.output.TopicArn !== env.AWS_SNS_TOPIC_ARN)) {
    console.warn("Validation failed on SNS payload");

    throw createError({
      status: 400,
      statusMessage: "Invalid SNS payload",
    });
  }

  const validator = new Validator();

  try {
    await validator.validate(payload.output);
  } catch {
    console.warn("Validation failed on SNS payload");

    throw createError({
      status: 400,
      statusMessage: "Invalid signature",
    });
  }

  const messageValidationResult = await v.safeParseAsync(
    v.object({
      notificationType: v.union([
        v.literal("Bounce"),
        v.literal("Delivery"),
        v.literal("Complaint"),
      ]),
      mail: v.object({
        timestamp: v.string(),
        messageId: v.string(),
      }),
    }),
    JSON.parse(payload.output.Message)
  )

  if (!messageValidationResult.success) {
    console.warn("Validation failed on SNS payload");

    throw createError({
      status: 400,
      statusMessage: "Invalid message",
    });
  }

  const message = messageValidationResult.output;

  await db
    .update(emailsTable)
    .set({
      status:
        message.notificationType === "Delivery"
          ? "DELIVERED"
          : message.notificationType === "Bounce"
          ? "BOUNCED"
          : "COMPLAINED",
      updatedAt: new Date(),
    })
    .where(eq(emailsTable.id, message.mail.messageId));

  return {
    success: true,
  };
}
