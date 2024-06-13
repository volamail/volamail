import { eq } from "drizzle-orm";
import { cache } from "@solidjs/router";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { apiTokensTable } from "../db/schema";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const getProjectTokens = cache(async (projectId: string) => {
  "use server";

  const user = requireUser();

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId,
  });

  return await db.query.apiTokensTable.findMany({
    where: eq(apiTokensTable.projectId, projectId),
    with: {
      creator: true,
    },
  });
}, "tokens");
