import { eq, sql } from "drizzle-orm";
import { action } from "@solidjs/router";
import { createError } from "vinxi/http";
import { object, optional, record, string } from "valibot";

import { db } from "../db";
import { sendMail } from "./send";
import { requireUser } from "../auth/utils";
import { subscriptionsTable } from "../db/schema";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { parseFormData } from "../server-utils";

export const sendTestMail = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const payload = await parseFormData(
    object({
      projectId: string(),
      subject: string(),
      body: string(),
      data: optional(record(string(), string())),
    }),
    formData
  );

  const { meta } = await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: payload.projectId,
  });

  const subcription = await db.query.subscriptionsTable.findFirst({
    where: eq(subscriptionsTable.id, meta.project.team.subscriptionId),
  });

  if (!subcription) {
    throw createError({
      statusCode: 404,
      statusMessage: "Subscription associated with this project not found",
    });
  }

  if (subcription.remainingQuota <= 0) {
    throw createError({
      statusCode: 429,
      statusMessage: "You have reached your monthly quota",
    });
  }

  try {
    await sendMail({
      // TODO: Unmock this
      from: "luca.farci@vlkstudio.com",
      to: "info@volamail.com",
      body: payload.body,
      subject: payload.subject,
      data: payload.data || {},
    });
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }

  // TODO: wrap this (and above) in a transaction
  await db
    .update(subscriptionsTable)
    .set({
      remainingQuota: sql`${subscriptionsTable.remainingQuota} - 1`,
    })
    .where(eq(subscriptionsTable.id, subcription.id));

  return {
    success: true,
  };
});
