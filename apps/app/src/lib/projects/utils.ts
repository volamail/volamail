import { eq, inArray } from "drizzle-orm";
import { createError } from "vinxi/http";
import { projectsTable, teamMembersTable, teamsTable } from "../db/schema";

import { db } from "../db";
import { sesClient } from "../mail/send";
import { env } from "../env";
import { s3 } from "../media/server-utils";

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

  const own =
    teams.find((team) => team.personalTeamOwner?.id === userId)?.projects || [];

  const other = teams.filter((team) => team.personalTeamOwner?.id !== userId);

  return {
    personal: own,
    teams: other,
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

export async function deleteProjectWithCleanup(projectId: string) {
  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
    with: {
      images: true,
      domains: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await db.transaction(async (db) => {
    await Promise.all([
      db.delete(projectsTable).where(eq(projectsTable.id, projectId)),
      project.images.length > 0 &&
        s3.deleteObjects({
          Bucket: env.AWS_BUCKET,
          Delete: {
            Objects: project.images.map((image) => ({
              Key: `media/${image.id}`,
            })),
          },
        }),
      Promise.all(
        project.domains.map((domain) =>
          sesClient.deleteEmailIdentity({
            EmailIdentity: domain.domain,
          })
        )
      ),
    ]);
  });
}
