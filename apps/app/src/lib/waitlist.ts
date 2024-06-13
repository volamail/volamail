import { action } from "@solidjs/router";
import { db } from "./db";
import * as schema from "./db/schema";
import { object, parseAsync, string } from "valibot";

export const addToWaitlist = action(async (formData: FormData) => {
  "use server";

  const values = Object.fromEntries(formData);

  try {
    const payload = await parseAsync(
      object({
        email: string(),
      }),
      values
    );

    await db.insert(schema.waitlistTable).values(payload);

    return {
      success: true,
    };
  } catch {
    throw new Error("Oh no zio pera");
  }
});
