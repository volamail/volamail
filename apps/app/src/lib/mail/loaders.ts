import { cache } from "@solidjs/router";
import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";

import { db } from "../db";
import { emailsTable } from "../db/schema";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { DateTime } from "luxon";

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
        where: and(eq(emailsTable.projectId, projectId), gt(emailsTable.sentAt, DateTime.now().minus({ days: 30 }).toJSDate())),
        columns: {},
        extras: {
          count: sql<number>`COUNT(*)`.as("count"),
        },
      }),
      db.query.emailsTable.findMany({
        where: and(eq(emailsTable.projectId, projectId), gt(emailsTable.sentAt, DateTime.now().minus({ days: 30 }).toJSDate())),
        orderBy: desc(emailsTable.sentAt),
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
