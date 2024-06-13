import { action } from "@solidjs/router";
import { createError } from "vinxi/http";
import { object, optional, parseAsync, record, string } from "valibot";

import { sendMail } from "./send";
import { requireUser } from "../auth/utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const sendTestMail = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      projectId: string(),
      subject: string(),
      body: string(),
      data: optional(record(string(), string())),
    }),
    values
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: payload.projectId,
  });

  try {
    await sendMail({
      // TODO: Unmock this
      from: "luca.farci@vlkstudio.com",
      to: "luca.farci@vlkstudio.com",
      body: payload.body,
      subject: payload.subject,
      data: payload.data || {},
    });
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }

  return {
    success: true,
  };
});
