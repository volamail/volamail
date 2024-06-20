import { nanoid } from "nanoid";
import { action } from "@solidjs/router";
import { object, string } from "valibot";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { apiTokensTable } from "../db/schema";
import { parseFormData } from "../server-utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const createApiToken = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const payload = await parseFormData(
    object({
      projectId: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: payload.projectId,
  });

  await db.insert(apiTokensTable).values({
    token: `vl_${nanoid(32)}`,
    projectId: payload.projectId,
    creatorId: user.id,
  });

  return {
    success: true,
  };
}, "tokens");
