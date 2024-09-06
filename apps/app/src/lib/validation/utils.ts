import type { ObjectPathItem, ValiError } from "valibot";

// biome-ignore lint/suspicious/noExplicitAny: This is fine
export function formatValiError(error: ValiError<any>) {
	return `${error.issues
		.map(
			(issue) =>
				`${issue.path?.map((path: ObjectPathItem) => path.key).join(".")}: ${
					issue.message
				}`,
		)
		.join(", ")}`;
}
