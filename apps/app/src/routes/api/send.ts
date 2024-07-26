import * as v from "valibot";
import { createError } from "vinxi/http";
import { and, eq, sql } from "drizzle-orm";
import type { APIEvent } from "@solidjs/start/server";

import { db } from "~/lib/db";
import { lucia } from "~/lib/auth/lucia";
import * as schema from "~/lib/db/schema";
import { sendMail } from "~/lib/mail/send";
import { isSelfHosted } from "~/lib/environment/utils";

export async function POST({ request }: APIEvent) {
  // TODO: Rate-limit

  const authHeader = request.headers.get("Authorization");

  const token = lucia.readBearerToken(authHeader || "");

  if (!token) {
    throw createError({
      status: 401,
      statusMessage: "Unauthorized",
    });
  }

  const body = await request.json();

  const payload = await v.parseAsync(
    v.object({
      template: v.string(
        'invalid "template" value. it should be a string with the id of the email template'
      ),
      data: v.optional(
        v.record(
          v.string(),
          v.string(),
          '"data" must be a record of string:string pairs'
        )
      ),
      from: v.pipe(
        v.string('"from" email address is required'),
        v.email('"from" is not a valid email address')
      ),
      to: v.pipe(
        v.string('"to" email address is required'),
        v.email('"to" is not a valid email address')
      ),
    }),
    body
  );

  const tokenRow = await db.query.apiTokensTable.findFirst({
    where: eq(schema.apiTokensTable.token, token),
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

  if (!tokenRow) {
    throw createError({
      status: 401,
      statusMessage: "Unauthorized",
    });
  }

  const team = tokenRow.project.team;
  const project = tokenRow.project;

  if (team.subscription.remainingQuota <= 0 && !isSelfHosted()) {
    throw createError({
      status: 429,
      statusMessage: "Quota reached",
    });
  }

  const template = await db.query.templatesTable.findFirst({
    where: and(
      eq(schema.templatesTable.id, payload.template),
      eq(schema.templatesTable.projectId, project.id)
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
      eq(schema.domainsTable.projectId, project.id),
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
    from: `${project.name} <${payload.from}>`,
    to: payload.to,
    subject: template.subject,
    body: template.body,
    data: payload.data,
  });

  // TODO: wrap this (and above) in a transaction
  if (!isSelfHosted()) {
    await db
      .update(schema.subscriptionsTable)
      .set({
        remainingQuota: sql`${schema.subscriptionsTable.remainingQuota} - 1`,
      })
      .where(eq(schema.subscriptionsTable.id, team.subscription.id));
  }

  return {
    success: true,
  };
}
