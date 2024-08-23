import { and, eq } from "drizzle-orm";
import { action } from "@solidjs/router";
import { createError } from "vinxi/http";
import { object, string } from "valibot";
import { AlreadyExistsException } from "@aws-sdk/client-sesv2";

import { db } from "../db";
import { sesClientV2 } from "../mail/send";
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

  try {
    const identity = await sesClientV2.createEmailIdentity({
      EmailIdentity: body.domain,
    });

    await db.insert(domainsTable).values({
      domain: body.domain,
      projectId: body.projectId,
      tokens: identity.DkimAttributes!.Tokens!,
    });
  } catch (e) {
    if (e instanceof AlreadyExistsException) {
      throw createError({
        statusCode: 409,
        statusMessage: "Domain already registered",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }

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
    await sesClientV2.deleteEmailIdentity({
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
