import { eq, sql } from "drizzle-orm";
import { action } from "@solidjs/router";
import { createError } from "vinxi/http";
import { object, optional, record, string } from "valibot";

import { db } from "../db";
import { sendMail } from "./send";
import { requireUser } from "../auth/utils";
import { parseFormData } from "../server-utils";
import { subscriptionsTable } from "../db/schema";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { isSelfHosted } from "../environment/utils";
import { env } from "../environment/env";

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
      statusMessage: "No subscription",
    });
  }

  if (subcription.remainingQuota <= 0 && !isSelfHosted()) {
    throw createError({
      statusCode: 429,
      statusMessage: "Quota reached",
    });
  }

  try {
    await sendMail({
      from: env.NOREPLY_EMAIL,
      to: user.email,
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
  if (!isSelfHosted()) {
    await db
      .update(subscriptionsTable)
      .set({
        remainingQuota: sql`${subscriptionsTable.remainingQuota} - 1`,
      })
      .where(eq(subscriptionsTable.id, subcription.id));
  }

  return {
    success: true,
  };
});
