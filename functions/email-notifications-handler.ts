import { db } from "@/modules/database";
import { emailsTable } from "@/modules/database/schema";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { eq } from "drizzle-orm";
import Validator from "sns-payload-validator";
import { createError } from "vinxi/http";
import { z } from "zod";

export async function handler(event: APIGatewayProxyEventV2) {
	if (!event.body) {
		return {
			statusCode: 400,
			body: "No body provided",
		};
	}

	const body = JSON.parse(event.body);

	const validateResult = await z
		.object({
			Type: z.literal("Notification"),
			Signature: z.string(),
			SigningCertURL: z.string(),
			SignatureVersion: z.literal("1"),
			TopicArn: z.string(),
			Message: z.string(),
			MessageId: z.string(),
			Timestamp: z.string(),
		})
		.safeParseAsync(body);

	if (!validateResult.success) {
		return {
			statusCode: 400,
			body: "Validation error",
		};
	}

	const payload = validateResult.data;

	const validator = new Validator();

	try {
		await validator.validate(payload);
	} catch {
		return {
			statusCode: 400,
			body: "Invalid signature",
		};
	}

	const messageValidationResult = await z
		.object({
			notificationType: z.union([
				z.literal("Bounce"),
				z.literal("Delivery"),
				z.literal("Complaint"),
			]),
			mail: z.object({
				timestamp: z.string(),
				messageId: z.string(),
			}),
		})
		.safeParseAsync(JSON.parse(payload.Message));

	if (!messageValidationResult.success) {
		console.warn("Validation failed on SNS payload");

		throw createError({
			status: 400,
			statusMessage: "Invalid message",
		});
	}

	const message = messageValidationResult.data;

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
		status: 200,
		body: "Success",
	};
}
