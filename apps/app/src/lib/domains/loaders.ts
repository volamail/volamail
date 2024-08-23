import { desc, eq } from "drizzle-orm";
import { cache } from "@solidjs/router";

import { db } from "../db";
import * as mutations from "./mutations";
import { sesClientV2 } from "../mail/send";
import { requireUser } from "../auth/utils";
import { domainsTable } from "../db/schema";
import { requireUserToBeMemberOfProject } from "../projects/utils";
import { getDeliveryNotificationsEnabled } from "../mail/config";

export const getProjectDomains = cache(async (projectId: string) => {
  "use server";

  const user = requireUser();

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId,
  });

  const domainRows = await db.query.domainsTable.findMany({
    where: eq(domainsTable.projectId, projectId),
    orderBy: desc(domainsTable.createdAt),
  });

  return await Promise.all(
    domainRows.map(async (row) => {
      const identity = await sesClientV2.getEmailIdentity({
        EmailIdentity: row.domain,
      });

      const verified = identity.VerifiedForSendingStatus;

      if (
        verified &&
        !row.receivesDeliveryNotifications &&
        getDeliveryNotificationsEnabled()
      ) {
        await mutations.prepareNotificationsForIdentity(row.domain);

        await db
          .update(domainsTable)
          .set({
            receivesDeliveryNotifications: true,
          })
          .where(eq(domainsTable.id, row.id));
      }

      if (verified !== row.verified) {
        await db
          .update(domainsTable)
          .set({
            verified,
          })
          .where(eq(domainsTable.id, row.id));
      }

      return {
        ...row,
        verified,
      };
    })
  );
}, "domains");
