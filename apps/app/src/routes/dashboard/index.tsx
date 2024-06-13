import { createError } from "vinxi/http";
import { and, eq, isNull } from "drizzle-orm";
import { getRequestEvent } from "solid-js/web";
import { useNavigate, type RouteDefinition } from "@solidjs/router";

import { db } from "~/lib/db";
import { projectsTable } from "~/lib/db/schema";

async function getDefaultProject() {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    return null;
  }

  const project = await db.query.projectsTable.findFirst({
    columns: {
      id: true,
    },
    where: and(
      eq(projectsTable.creatorId, user.id),
      isNull(projectsTable.teamId)
    ),
  });

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

    navigate(`/dashboard/t/0/p/${project.id}/emails`);
  },
};

export default function Dashboard() {
  return <div />;
}
