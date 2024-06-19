import { eq } from "drizzle-orm";
import { cache } from "@solidjs/router";

import { db } from "../db";
import { sesClient } from "../mail/send";
import { requireUser } from "../auth/utils";
import { domainsTable } from "../db/schema";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const getProjectDomains = cache(async (projectId: string) => {
  "use server";

  const user = requireUser();

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId,
  });

  const domainRows = await db.query.domainsTable.findMany({
    where: eq(domainsTable.projectId, projectId),
  });

  return await Promise.all(
    domainRows.map(async (row) => {
      const identity = await sesClient.getEmailIdentity({
        EmailIdentity: row.domain,
      });

      const verified = identity.VerifiedForSendingStatus;

      await db
        .update(domainsTable)
        .set({ verified })
        .where(eq(domainsTable.id, row.id));

      return {
        ...row,
        verified,
      };
    })
  );
}, "domains");
