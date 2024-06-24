import postgres from "postgres";
import { createError } from "vinxi/http";
import { APIEvent } from "@solidjs/start/server";
import { email, pipe, strictObject, string } from "valibot";

import { db } from "~/lib/db";
import { waitlistTable } from "~/lib/db/schema";
import { parseFormData } from "~/lib/server-utils";

export async function POST({ request }: APIEvent) {
  // TODO: Rate-limit by IP

  const formData = await request.formData();

  const data = await parseFormData(
    strictObject({
      email: pipe(string(), email()),
    }),
    formData
  );

  try {
    await db.insert(waitlistTable).values({
      email: data.email,
    });

    return {
      success: true,
    };
  } catch (e) {
    throw createError({
      statusCode: e instanceof postgres.PostgresError ? 409 : 500,
      statusMessage:
        e instanceof postgres.PostgresError
          ? "Access has already been requested for this email"
          : undefined,
    });
  }
}
