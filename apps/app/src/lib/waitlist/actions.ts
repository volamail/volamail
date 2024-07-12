import { eq } from "drizzle-orm";
import { action } from "@solidjs/router";
import { object, string } from "valibot";
import { createError } from "vinxi/http";

import { db } from "../db";
import { env } from "../environment/env";
import * as schema from "../db/schema";
import { sendMail } from "../mail/send";
import { requireUser } from "../auth/utils";
import { parseFormData } from "../server-utils";
import earlyAccessInviteTemplate from "../static-templates/early-access-invite.html?raw";
import { isSelfHosted } from "../environment/utils";

export const addToWaitlist = action(async (formData: FormData) => {
  "use server";

  if (isSelfHosted()) {
    throw createError({
      status: 404,
      statusMessage: "Not found",
    });
  }

  const payload = await parseFormData(
    object({
      email: string(),
    }),
    formData
  );

  await db.insert(schema.waitlistTable).values(payload);

  return {
    success: true,
  };
});

export const approveToWaitlist = action(async (formData: FormData) => {
  "use server";

  if (env.VITE_SELF_HOSTED === "true") {
    throw createError({
      status: 404,
      statusMessage: "Not found",
    });
  }

  const user = requireUser();

  if (user.id !== env.ADMIN_ID) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not an admin",
    });
  }

  const payload = await parseFormData(
    object({
      email: string(),
    }),
    formData
  );

  await db
    .update(schema.waitlistTable)
    .set({ approved: true })
    .where(eq(schema.waitlistTable.email, payload.email));

  if (import.meta.env.PROD) {
    await sendMail({
      from: env.NOREPLY_EMAIL,
      to: payload.email,
      subject: "You've been approved to the early access of Volamail",
      body: earlyAccessInviteTemplate,
      data: {
        login_link: `${import.meta.env.DEV ? "http" : "https"}://${
          env.SITE_DOMAIN
        }/login?email=${payload.email}`,
      },
    });
  } else {
    console.log("Sent approval email to", payload.email);
  }

  return {
    success: true,
  };
});
