import * as v from "valibot";

export async function parseFormData<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(schema: T, formData: FormData) {
  const entries = Object.fromEntries(formData);

  return await v.parseAsync(schema, entries);
}
