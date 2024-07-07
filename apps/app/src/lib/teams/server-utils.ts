import { inArray, eq } from "drizzle-orm";
import { db } from "../db";
import { teamsTable, teamMembersTable } from "../db/schema";
import { SUBSCRIPTION_QUOTAS } from "../subscriptions/constants";

export async function getUserTeams(userId: string) {
  const teams = (
    await db.query.teamsTable.findMany({
      where: inArray(
        teamsTable.id,
        db
          .select({ id: teamMembersTable.teamId })
          .from(teamMembersTable)
          .where(eq(teamMembersTable.userId, userId))
      ),
      with: {
        projects: true,
        personalTeamOwner: true,
        subscription: true,
      },
    })
  ).map((team) => {
    const quotas =
      team.subscription.tier === "CUSTOM"
        ? {
            emails: team.subscription.monthlyQuota,
            storage: team.subscription.storageQuota,
            projects: SUBSCRIPTION_QUOTAS.PRO.projects,
          }
        : SUBSCRIPTION_QUOTAS[team.subscription.tier];

    return {
      ...team,
      quotas,
      reachedProjectLimit: team.projects.length >= quotas.projects,
    };
  });

  const personalTeam = teams.find(
    (team) => team.personalTeamOwner?.id === userId
  );

  const other = teams.filter((team) => team.personalTeamOwner?.id !== userId);

  return {
    personal: personalTeam,
    other,
  };
}
