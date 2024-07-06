import { ObjectPathItem, ValiError } from "valibot";

export function formatValiError(error: ValiError<any>) {
  return `${error.issues
    .map(
      (issue) =>
        `${issue.path?.map((path: ObjectPathItem) => path.key).join(".")}: ${
          issue.message
        }`
    )
    .join(", ")}`;
}
