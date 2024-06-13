import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import type { APIEvent } from "@solidjs/start/server";
import { object, parseAsync, record, string } from "valibot";

import { db } from "~/lib/db";
import * as schema from "~/lib/db/schema";
import { sendMail } from "~/lib/mail/send";

export async function POST({ request }: APIEvent) {
  const body = await request.json();

  const payload = await parseAsync(
    object({
      token: string(),
      template: string(),
      data: record(string()),
    }),
    body
  );

  const token = await db.query.apiTokensTable.findFirst({
    where: eq(schema.apiTokensTable.token, payload.token),
  });

  if (!token) {
    throw createError({
      status: 401,
      statusMessage: "Unauthorized",
    });
  }

  await sendMail({
    // TODO: Unmock this
    from: "luca.farci@vlkstudio.com",
    to: "luca.farci@vlkstudio.com",
    template: payload.template,
    projectId: token.projectId,
    data: payload.data,
  });

  return {
    success: true,
  };
}
