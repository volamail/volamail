import { nanoid } from "nanoid";
import { action } from "@solidjs/router";
import { object, string } from "valibot";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { apiTokensTable } from "../db/schema";
import { parseFormData } from "../server-utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { count, eq } from "drizzle-orm";
import { MAX_TOKENS_PER_PROJECT } from "./constants";
import { createError } from "vinxi/http";

export const createApiToken = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const payload = await parseFormData(
		object({
			projectId: string(),
		}),
		formData,
	);

	await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: payload.projectId,
	});

	// Intentionally count revoked tokens too for now
	const [countRow] = await db
		.select({
			count: count(),
		})
		.from(apiTokensTable)
		.where(eq(apiTokensTable.projectId, payload.projectId));

	if (countRow.count >= MAX_TOKENS_PER_PROJECT) {
		throw createError({
			statusCode: 429,
			statusMessage: "Maximum number of tokens reached for this project",
		});
	}

	await db.insert(apiTokensTable).values({
		token: `vl_${nanoid(32)}`,
		projectId: payload.projectId,
		creatorId: user.id,
	});

	return {
		success: true,
	};
}, "tokens");

export const revokeApiToken = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const payload = await parseFormData(
		object({
			id: string(),
			projectId: string(),
		}),
		formData,
	);

	await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: payload.projectId,
	});

	await db
		.update(apiTokensTable)
		.set({ revokedAt: new Date() })
		.where(eq(apiTokensTable.id, payload.id));

	return {
		success: true,
	};
}, "tokens");
