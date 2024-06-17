import { and, eq, sql } from "drizzle-orm";
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
      data: record(string(), string()),
    }),
    body
  );

  const token = await db.query.apiTokensTable.findFirst({
    where: eq(schema.apiTokensTable.token, payload.token),
    with: {
      project: {
        with: {
          team: {
            with: {
              subscription: true,
            },
          },
        },
      },
    },
  });

  if (!token) {
    throw createError({
      status: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { team } = token.project;

  if (team.subscription.remainingQuota <= 0) {
    throw createError({
      status: 429,
      statusMessage: "You have reached your quota",
    });
  }

  const template = await db.query.templatesTable.findFirst({
    where: and(
      eq(schema.templatesTable.projectId, token.projectId),
      eq(schema.templatesTable.id, payload.template)
    ),
  });

  if (!template) {
    throw createError({
      status: 404,
      statusMessage: "Template not found",
    });
  }

  await sendMail({
    // TODO: Unmock this
    from: "luca.farci@vlkstudio.com",
    to: "luca.farci@vlkstudio.com",
    subject: template.subject,
    body: template.body,
    data: payload.data,
  });

  // TODO: wrap this (and above) in a transaction
  await db
    .update(schema.subscriptionsTable)
    .set({
      remainingQuota: sql`${schema.subscriptionsTable.remainingQuota} - 1`,
    })
    .where(eq(schema.subscriptionsTable.id, team.subscription.id));

  return {
    success: true,
  };
}
