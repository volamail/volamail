import { cache } from "@solidjs/router";
import { eq } from "drizzle-orm";

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

  return await db.query.templatesTable.findFirst({
    where: eq(schema.templatesTable.id, id),
  });
}, "templates");
