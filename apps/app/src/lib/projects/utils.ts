import { eq, inArray } from "drizzle-orm";
import { createError } from "vinxi/http";
import { projectsTable, teamMembersTable, teamsTable } from "../db/schema";

import { db } from "../db";

export async function getUserProjects(userId: string) {
  const teams = await db.query.teamsTable.findMany({
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
    },
  });

  return {
    teams: teams.map((team) => ({
      ...team,
      personal: team.personalTeamOwner !== null,
    })),
  };
}

export async function requireUserToBeMemberOfTeam(params: {
  userId: string;
  teamId: string;
}) {
  const { userId, teamId } = params;

  const team = await db.query.teamsTable.findFirst({
    where: eq(teamsTable.id, teamId),
    with: {
      members: true,
    },
  });

  if (!team) {
    throw createError({
      statusCode: 404,
      statusMessage: "Team not found",
    });
  }

  if (!team.members.find((member) => member.userId === userId)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not a member of this team",
    });
  }

  return {
    meta: {
      team,
    },
  };
}

export async function requireUserToBeMemberOfProject(params: {
  userId: string;
  projectId: string;
}) {
  const { userId, projectId } = params;

  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
    with: {
      team: { with: { members: true } },
    },
  });

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Project not found",
    });
  }

  if (!project.team) {
    if (project.creatorId === userId) {
      return {
        meta: {
          project,
        },
      };
    }

    throw createError({
      statusCode: 403,
      statusMessage: "You are not a member of this project",
    });
  }

  const member = project.team.members.find(
    (member) => member.userId === userId
  );

  if (!member) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not a member of this project",
    });
  }

  return {
    meta: {
      project,
    },
  };
}
