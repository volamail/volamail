import { nanoid } from "nanoid";
import { action } from "@solidjs/router";
import { object, parseAsync, string } from "valibot";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { apiTokensTable } from "../db/schema";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const createApiToken = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      projectId: string(),
    }),
    values
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
