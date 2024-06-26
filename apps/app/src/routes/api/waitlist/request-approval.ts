import { APIEvent } from "@solidjs/start/server";
import { InferInput, email, empty, pipe, strictObject, string } from "valibot";

import { db } from "~/lib/db";
import { waitlistTable } from "~/lib/db/schema";
import { parseFormData } from "~/lib/server-utils";

const schema = strictObject({
  email: pipe(string(), email()),
  username: pipe(string(), empty()),
});

export async function POST({ request }: APIEvent) {
  // TODO: Rate-limit by IP

  const formData = await request.formData();

  let data: InferInput<typeof schema>;

  try {
    data = await parseFormData(schema, formData);
  } catch {
    console.log("Honeypot triggered");

    return {
      success: true,
    };
  }

  try {
    await db.insert(waitlistTable).values({
      email: data.email,
    });
  } catch (e) {
    console.warn("Access already request for email", data.email);
  }

  return {
    success: true,
  };
}
