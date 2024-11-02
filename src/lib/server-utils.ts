import _ from "lodash";
import { type RequestEvent, getRequestEvent } from "solid-js/web";
import * as v from "valibot";
import { createError } from "vinxi/http";
import type { DbUser } from "./db/schema";

export async function parseFormData<
	T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(schema: T, formData: FormData) {
	const entries = Object.fromEntries(formData);

	const result = await v.safeParseAsync(schema, entries);

	if (result.success) {
		return result.output;
	}

	throw createError({
		statusCode: 400,
		statusMessage: result.issues[0]?.message || "Invalid data",
	});
}

export function createFormDataMutation<
	// biome-ignore lint/suspicious/noExplicitAny: Generics are fine
	Schema extends v.ObjectSchema<any, any>,
	Return,
	Public extends boolean = false,
>(options: {
	public?: Public;
	schema: Schema;
	handler: (context: {
		payload: v.InferOutput<Schema>;
		user: Public extends true ? DbUser | null : DbUser;
		event: RequestEvent;
	}) => Promise<Return>;
}) {
	return async (formData: FormData) => {
		const entries = getNestedFormData(formData);

		const validationResult = await v.safeParseAsync(options.schema, entries);

		if (!validationResult.success) {
			console.error(
				"Validation error",
				v.flatten(validationResult.issues).nested,
			);

			throw createError({
				statusCode: 400,
				statusMessage: "Validation error",
			});
		}

		const requestEvent = getRequestEvent()!;

		const user = requestEvent.locals.user;

		if (!options.public && !user) {
			throw createError({
				statusCode: 401,
				statusMessage: "Unauthorized",
			});
		}

		return options.handler({
			payload: validationResult.output,
			// @ts-expect-error - Should be fine
			user,
			event: requestEvent,
		});
	};
}

function getNestedFormData(formData: FormData) {
	const obj = {};

	const entries = Object.fromEntries(formData.entries());

	for (const field in entries) {
		_.set(obj, field, entries[field]);
	}

	return obj;
}
