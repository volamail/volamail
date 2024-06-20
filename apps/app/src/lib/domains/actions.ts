import { and, eq } from "drizzle-orm";
import { action } from "@solidjs/router";
import { createError } from "vinxi/http";
import { object, string } from "valibot";

import { db } from "../db";
import { sesClient } from "../mail/send";
import { requireUser } from "../auth/utils";
import { domainsTable } from "../db/schema";
import { parseFormData } from "../server-utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const createDomain = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const body = await parseFormData(
    object({
      projectId: string(),
      domain: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: body.projectId,
  });

  const identity = await sesClient.createEmailIdentity({
    EmailIdentity: body.domain,
  });

  await db.insert(domainsTable).values({
    domain: body.domain,
    projectId: body.projectId,
    tokens: identity.DkimAttributes!.Tokens!,
  });

  return {
    success: true,
  };
}, "domains");

export const deleteDomain = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const body = await parseFormData(
    object({
      projectId: string(),
      domainId: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: body.projectId,
  });

  const domain = await db.query.domainsTable.findFirst({
    where: and(
      eq(domainsTable.id, body.domainId),
      eq(domainsTable.projectId, body.projectId)
    ),
  });

  if (!domain) {
    throw createError({
      statusCode: 404,
      statusMessage: "Domain not found",
    });
  }

  await db.transaction(async (db) => {
    await sesClient.deleteEmailIdentity({
      EmailIdentity: domain.domain,
    });

    await db
      .delete(domainsTable)
      .where(
        and(
          eq(domainsTable.id, body.domainId),
          eq(domainsTable.projectId, body.projectId)
        )
      );
  });

  return {
    success: true,
  };
}, "domains");
