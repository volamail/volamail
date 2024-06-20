import { createError } from "vinxi/http";
import { and, eq, sql } from "drizzle-orm";
import type { APIEvent } from "@solidjs/start/server";
import { email, object, parseAsync, pipe, record, string } from "valibot";

import { db } from "~/lib/db";
import * as schema from "~/lib/db/schema";
import { sendMail } from "~/lib/mail/send";

export async function POST({ request }: APIEvent) {
  // TODO: Rate-limit

  const body = await request.json();

  const payload = await parseAsync(
    object({
      token: string(),
      template: string(),
      data: record(string(), string()),
      from: pipe(string(), email()),
      to: pipe(string(), email()),
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
      statusMessage: "Quota reached",
    });
  }

  const template = await db.query.templatesTable.findFirst({
    where: and(
      eq(schema.templatesTable.id, payload.template),
      eq(schema.templatesTable.projectId, token.projectId)
    ),
  });

  if (!template) {
    throw createError({
      status: 404,
      statusMessage: "Template not found",
    });
  }

  const fromDomain = payload.from.split("@")[1];

  const domain = await db.query.domainsTable.findFirst({
    where: and(
      eq(schema.domainsTable.projectId, token.projectId),
      eq(schema.domainsTable.domain, fromDomain)
    ),
    columns: {
      id: true,
    },
  });

  if (!domain) {
    throw createError({
      status: 400,
      statusMessage: "From domain not found",
    });
  }

  await sendMail({
    from: payload.from,
    to: payload.to,
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
