import { action } from "@solidjs/router";
import { db } from "./db";
import * as schema from "./db/schema";
import { object, parseAsync, string } from "valibot";
import { parseFormData } from "./server-utils";

export const addToWaitlist = action(async (formData: FormData) => {
  "use server";

  const payload = await parseFormData(
    object({
      email: string(),
    }),
    formData
  );

  await db.insert(schema.waitlistTable).values(payload);

  return {
    success: true,
  };
});
