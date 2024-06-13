import { eq } from "drizzle-orm";
import { cache } from "@solidjs/router";

import { db } from "~/lib/db";
import * as schema from "~/lib/db/schema";

export const getProjectTemplates = cache(async (projectId: string) => {
  "use server";

  return await db.query.templatesTable.findMany({
    where: eq(schema.templatesTable.projectId, projectId),
  });
}, "templates");

export const getTemplate = cache(async (id: string) => {
  "use server";

  return await db.query.templatesTable.findFirst({
    where: eq(schema.templatesTable.id, id),
  });
}, "templates");
