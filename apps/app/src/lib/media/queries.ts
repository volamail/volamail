import { eq } from "drizzle-orm";
import { cache } from "@solidjs/router";

import { db } from "../db";
import { imagesTable } from "../db/schema";
import { requireUser } from "../auth/utils";
import { getMediaUrl } from "./server-utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const getProjectImages = cache(async (projectId: string) => {
  "use server";

  const user = requireUser();

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId,
  });

  const rows = await db.query.imagesTable.findMany({
    where: eq(imagesTable.projectId, projectId),
  });

  return rows.map((row) => ({
    ...row,
    url: getMediaUrl(row.id),
  }));
}, "media");
