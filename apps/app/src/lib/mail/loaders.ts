import { cache } from "@solidjs/router";
import { and, eq, sql } from "drizzle-orm";

import { db } from "../db";
import { emailsTable } from "../db/schema";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const getProjectEmails = cache(
  async (projectId: string, page: number = 0) => {
    "use server";

    const user = requireUser();

    await requireUserToBeMemberOfProject({
      userId: user.id,
      projectId,
    });

    const [total, rows] = await Promise.all([
      db.query.emailsTable.findFirst({
        where: and(eq(emailsTable.projectId, projectId)),
        columns: {},
        extras: {
          count: sql<number>`COUNT(*)`.as("count"),
        },
      }),
      db.query.emailsTable.findMany({
        where: and(eq(emailsTable.projectId, projectId)),
        orderBy: emailsTable.sentAt,
        offset: page * 50,
        limit: 50,
      }),
    ]);

    return {
      pages: Math.ceil(total!.count / 50),
      rows,
      total: total!.count,
    };
  },
  "emails"
);
