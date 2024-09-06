import * as v from "valibot";
import { createError } from "vinxi/http";

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
