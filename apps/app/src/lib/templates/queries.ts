import { eq } from "drizzle-orm";
import { cache } from "@solidjs/router";
import { createError } from "vinxi/http";

import { db } from "~/lib/db";
import * as schema from "~/lib/db/schema";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const getProjectTemplates = cache(async (projectId: string) => {
  "use server";

  const user = requireUser();

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId,
  });

  return await db.query.templatesTable.findMany({
    where: eq(schema.templatesTable.projectId, projectId),
    columns: {
      body: false,
    },
  });
}, "templates");

export const getTemplate = cache(async (id: string) => {
  "use server";

  const template = await db.query.templatesTable.findFirst({
    where: eq(schema.templatesTable.id, id),
  });

  if (!template) {
    throw createError({
      statusCode: 404,
      statusMessage: "Template not found",
    });
  }

  return template;
}, "templates");
