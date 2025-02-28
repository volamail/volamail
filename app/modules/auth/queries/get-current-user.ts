import { clientEnv } from "@/modules/client-env";
import { getUserTeamsWithProjects } from "@/modules/organization/projects";
import { createServerFn } from "@tanstack/start";
import { getWebRequest } from "vinxi/http";
import { auth } from "../auth";

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    console.log(
      `${import.meta.env.PROD ? "https" : "http"}://${clientEnv.VITE_DOMAIN}`
    );

    const request = getWebRequest();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return null;
    }

    const teams = await getUserTeamsWithProjects(session.user.id);

    const defaultProject = teams[0].projects[0];

    return {
      ...session.user,
      teams,
      defaultProject,
    };
  }
);
