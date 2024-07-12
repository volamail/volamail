import { getRequestEvent } from "solid-js/web";
import { cache, redirect } from "@solidjs/router";

import { env } from "../environment/env";

export const getCurrentUser = cache(async () => {
  "use server";

  const event = getRequestEvent()!;

  const user = event.locals.user;

  if (!user) {
    throw redirect("/login");
  }

  return {
    ...user,
    imageUrl: user.githubId
      ? `https://avatars.githubusercontent.com/u/${user.githubId}`
      : null,
    superadmin: "ADMIN_ID" in env && env.ADMIN_ID === user.id,
  };
}, "user");
