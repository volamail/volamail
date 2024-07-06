import { ulid } from "ulid";

import {
  teamsTable,
  usersTable,
  projectsTable,
  teamMembersTable,
  subscriptionsTable,
} from "../db/schema";
import { db } from "../db";
import {
  SUBSCRIPTION_QUOTAS,
  SUBSCRIPTION_TYPE_FREE,
} from "../subscriptions/constants";

export async function bootstrapUser(email: string) {
  const id = ulid();

  const name = email.split("@")[0];

  const { defaultProjectId, defaultTeamId } = await db.transaction(
    async (db) => {
      const [{ insertedId: subscriptionId }] = await db
        .insert(subscriptionsTable)
        .values({
          tier: SUBSCRIPTION_TYPE_FREE,
          status: "ACTIVE",
          monthlyQuota: SUBSCRIPTION_QUOTAS["FREE"]["emails"],
          remainingQuota: SUBSCRIPTION_QUOTAS["FREE"]["emails"],
          renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          lastRefilledAt: new Date(),
          periodType: "MONTHLY",
          price: "0.00",
          storageQuota: SUBSCRIPTION_QUOTAS["FREE"]["storage"],
        })
        .returning({ insertedId: subscriptionsTable.id });

      const [{ insertedId: defaultTeamId }] = await db
        .insert(teamsTable)
        .values({
          name: `${name}'s team`,
          subscriptionId,
        })
        .returning({ insertedId: teamsTable.id });

      await db.insert(usersTable).values({
        id,
        name,
        email,
        personalTeamId: defaultTeamId,
      });

      await db.insert(teamMembersTable).values({
        userId: id,
        teamId: defaultTeamId,
      });

      const [{ insertedId: defaultProjectId }] = await db
        .insert(projectsTable)
        .values({
          name: "Untitled project",
          teamId: defaultTeamId,
          creatorId: id,
        })
        .returning({ insertedId: projectsTable.id });

      return {
        defaultProjectId,
        defaultTeamId,
      };
    }
  );

  return {
    id,
    defaultTeamId,
    defaultProjectId,
  };
}
