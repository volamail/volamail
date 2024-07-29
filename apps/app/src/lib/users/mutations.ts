import { ulid } from "ulid";

import { db } from "../db";
import * as teams from "~/lib/teams";
import { teamMembersTable, usersTable } from "../db/schema";

export async function createUser({
  email,
  githubId,
}: {
  email: string;
  githubId?: number;
}) {
  const id = ulid();

  const name = email.split("@")[0];

  const { projectId, teamId } = await db.transaction(async (db) => {
    const { teamId, projectId } = await teams.mutations.createTeam(name, db);

    await db.insert(usersTable).values({
      id,
      email,
      name,
      personalTeamId: teamId,
      githubId: githubId || null,
    });

    await db.insert(teamMembersTable).values({
      teamId,
      userId: id,
    });

    return { projectId, teamId };
  });

  return {
    id,
    defaultTeamId: teamId,
    defaultProjectId: projectId,
  };
}
