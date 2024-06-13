import { eq } from "drizzle-orm";
import { createError } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { useNavigate, type RouteDefinition } from "@solidjs/router";

import { db } from "~/lib/db";
import { teamsTable } from "~/lib/db/schema";

async function getDefaultProject() {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    return null;
  }

  const personalTeam = await db.query.teamsTable.findFirst({
    where: eq(teamsTable.id, user.personalTeamId),
    with: {
      projects: true,
    },
  });

  const project = personalTeam?.projects[0];

  if (!project) {
    // TODO: Maybe create a default project here
    throw createError({
      statusCode: 500,
      statusMessage: "No user project found",
    });
  }

  return project;
}

export const route: RouteDefinition = {
  async load() {
    // Redirecting in route load like this is probably illegal
    // TODO: Find a better way to do this

    const navigate = useNavigate();

    const project = await getDefaultProject();

    if (!project) {
      navigate("/404");

      return;
    }

    navigate(`/t/${project.teamId}/p/${project.id}/emails`);
  },
};

export default function Dashboard() {
  return <div />;
}
