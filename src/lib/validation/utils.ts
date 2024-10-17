import {
	flatten,
	type BaseIssue,
	type BaseSchema,
	type ValiError,
} from "valibot";

export function formatValiError<
	T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(error: ValiError<T>) {
	return JSON.stringify(flatten(error.issues).nested);
}
