import { and, eq } from "drizzle-orm";
import { db } from "../database";
import {
  domainsTable,
  projectsTable,
  teamMembersTable,
} from "../database/schema";
import { deleteIdentity } from "../sending/identities";

export async function getUserTeamsWithProjects(userId: string) {
  const teamMemberships = await db.query.teamMembersTable.findMany({
    where: eq(teamMembersTable.userId, userId),
    with: {
      team: {
        with: {
          projects: true,
        },
      },
    },
  });

  return teamMemberships.map((membership) => membership.team);
}

export async function deleteProject(teamId: string, projectId: string) {
  return await db.transaction(async (db) => {
    // Delete project with cascades
    await db
      .delete(projectsTable)
      .where(
        and(eq(projectsTable.teamId, teamId), eq(projectsTable.id, projectId))
      );

    // Search identities linked to project
    const domains = await db.query.domainsTable.findMany({
      where: and(
        eq(domainsTable.teamId, teamId),
        eq(domainsTable.projectId, projectId)
      ),
    });

    // Delete all identities
    for (const row of domains) {
      if (!row.verified) {
        continue;
      }

      await deleteIdentity(row.domain);
    }
  });
}
