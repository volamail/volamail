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

  await db.insert(waitlistTable).values({
    email: data.email,
  });
}
