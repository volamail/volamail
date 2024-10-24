import { action } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import sizeOf from "image-size";
import type { ISizeCalculationResult } from "image-size/dist/types/interface";
import { nanoid } from "nanoid";
import { instance, object, optional, string } from "valibot";
import { createError } from "vinxi/http";

import { requireUser } from "../auth/utils";
import { db } from "../db";
import { imagesTable } from "../db/schema";
import { env } from "../environment/env";
import { isSelfHosted } from "../environment/utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { parseFormData } from "../server-utils";
import { requireProjectStorageLeft } from "./guards";
import { s3 } from "./s3";
import { getMediaUrl } from "./utils";

export const addImage = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const body = await parseFormData(
		object({
			projectId: string(),
			file: instance(File),
			name: optional(string()),
		}),
		formData,
	);

	if (!body.file || body.file.size === 0) {
		throw createError({
			statusCode: 400,
			statusMessage: "No file uploaded",
		});
	}

	const buffer = (await body.file.arrayBuffer()) as Buffer;

	let dimensions: ISizeCalculationResult;

	try {
		dimensions = sizeOf(new Uint8Array(buffer));
	} catch (e) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid image",
		});
	}

	const { meta } = await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: body.projectId,
	});

	if (!isSelfHosted()) {
		await requireProjectStorageLeft({
			projectId: meta.project.id,
			kilobytes: body.file.size / 1000,
			teamId: meta.project.team.id,
		});
	}

	const id = nanoid(32);

	try {
		await Promise.all([
			s3.putObject({
				Bucket: env.AWS_BUCKET,
				Key: `media/${id}`,
				Body: buffer,
				ContentType: body.file.type,
			}),
			db.insert(imagesTable).values({
				id,
				projectId: body.projectId,
				name: body.name || body.file.name,
				size: Math.floor(body.file.size / 1000),
				dimensions: `${dimensions.width}x${dimensions.height}`,
			}),
		]);
	} catch (e) {
		console.log(e);

		throw createError({
			statusCode: 500,
			statusMessage: "Internal server error",
		});
	}

	return {
		success: true,
		data: {
			id,
			url: getMediaUrl(id),
		},
	};
}, "media");

export const editMedia = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const body = await parseFormData(
		object({
			projectId: string(),
			id: string(),
			name: string(),
			file: optional(instance(File)),
		}),
		formData,
	);

	if (!body.file || body.file.size === 0) {
		await db
			.update(imagesTable)
			.set({
				name: body.name,
			})
			.where(
				and(
					eq(imagesTable.id, body.id),
					eq(imagesTable.projectId, body.projectId),
				),
			);

		return {
			success: true,
		};
	}

	const buffer = (await body.file.arrayBuffer()) as Buffer;

	let dimensions: ISizeCalculationResult;

	try {
		dimensions = sizeOf(new Uint8Array(buffer));
	} catch (e) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid image",
		});
	}

	const { meta } = await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: body.projectId,
	});

	if (!isSelfHosted()) {
		await requireProjectStorageLeft({
			projectId: meta.project.id,
			kilobytes: body.file.size / 1000,
			teamId: meta.project.team.id,
		});
	}

	await Promise.all([
		s3.putObject({
			Bucket: env.AWS_BUCKET,
			Key: `media/${body.id}`,
			Body: buffer,
			ContentType: body.file.type,
		}),
		db
			.update(imagesTable)
			.set({
				name: body.name,
				dimensions: `${dimensions.width}x${dimensions.height}`,
			})
			.where(
				and(
					eq(imagesTable.id, body.id),
					eq(imagesTable.projectId, body.projectId),
				),
			),
	]);

	await db
		.update(imagesTable)
		.set({
			name: body.name,
		})
		.where(
			and(
				eq(imagesTable.id, body.id),
				eq(imagesTable.projectId, body.projectId),
			),
		);

	return {
		success: true,
	};
}, "media");

export const deleteImage = action(async (formData: FormData) => {
	"use server";

	const user = requireUser();

	const body = await parseFormData(
		object({
			projectId: string(),
			id: string(),
		}),
		formData,
	);

	await requireUserToBeMemberOfProject({
		userId: user.id,
		projectId: body.projectId,
	});

	await Promise.all([
		s3.deleteObject({
			Bucket: env.AWS_BUCKET,
			Key: `media/${body.id}`,
		}),
		db
			.delete(imagesTable)
			.where(
				and(
					eq(imagesTable.id, body.id),
					eq(imagesTable.projectId, body.projectId),
				),
			),
	]);

	return {
		success: true,
	};
}, "media");
