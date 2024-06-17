import { generateText } from "ai";
import { eq, and } from "drizzle-orm";
import { createError } from "vinxi/http";
import { anthropic } from "@ai-sdk/anthropic";
import { action, redirect } from "@solidjs/router";
import { parseAsync, object, string, optional } from "valibot";

import { db } from "~/lib/db";
import * as schema from "~/lib/db/schema";
import { requireUser } from "~/lib/auth/utils";
import { requireUserToBeMemberOfProject } from "~/lib/projects/utils";

export const createTemplate = action(async (formData: FormData) => {
  "use server";

  const values = Object.fromEntries(formData);

  const result = await parseAsync(
    object({
      projectId: string(),
      body: string(),
      slug: string(),
      subject: string(),
    }),
    values
  );

  const user = requireUser();

  const { meta } = await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: result.projectId,
  });

  const existing = await db.query.templatesTable.findFirst({
    where: and(
      eq(schema.templatesTable.slug, result.slug),
      eq(schema.templatesTable.projectId, result.projectId)
    ),
    columns: {
      id: true,
    },
  });

  if (existing) {
    throw new Error("Template slug already in use");
  }

  await db.insert(schema.templatesTable).values(result);

  throw redirect(
    `/t/${meta.project.team?.id || 0}/p/${result.projectId}/emails`
  );
}, "templates");

export const editTemplate = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const result = await parseAsync(
    object({
      id: string(),
      slug: string(),
      subject: string(),
      body: string(),
    }),
    values
  );

  const template = await db.query.templatesTable.findFirst({
    where: eq(schema.templatesTable.id, result.id),
  });

  if (!template) {
    throw createError({
      statusCode: 404,
      statusMessage: "Template not found",
    });
  }

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: template.projectId,
  });

  // TODO: Check if slug is already in use

  await db
    .update(schema.templatesTable)
    .set(result)
    .where(eq(schema.templatesTable.id, result.id));

  return {
    success: true,
  };
}, "templates");

export const generateTemplate = action(async (formData: FormData) => {
  "use server";

  requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      prompt: string(),
      currentHtml: optional(string()),
    }),
    values
  );

  const INITIAL_GENERATION_PROMPT =
    "You are a HTML email template generator. You will be given a prompt and you should generate a HTML email based on the prompt. Respond with just the HTML code, nothing else, no markdown, no backticks. Use Helvetica unless told otherwise. Remember that HTML must be old e-mail compatible, so use tables for layouts instead of divs. Make sure that bgcolor is applied both as attribute AND as inline style to make the HTML compatible with as many email clients as possible. Remember the <style> tag doesn't work in email clients, so use inline styles on the elements instead. Don't output any meta tags or doctype, just the email <body>. For variables use double curly brackets with snake_case like {{variable_name}}";

  const EDIT_PROMPT =
    "You are a HTML email template editor. You will be given an existing HTML email template and a prompt. Your task is to edit the HTML email template based on the prompt. Respond with just the HTML code, nothing else, no markdown, no backticks, just HTML. Remember that HTML must be old e-mail compatible, so use tables for layouts instead of divs. Make sure that bgcolor is applied both as attribute AND as inline style to make the HTML compatible with as many email clients as possible. Remember the <style> tag doesn't work in email clients, so use inline styles on the elements instead. Remember margins don't work on td elements, if a global margin is needed add it to the upper table. Don't output any meta tags or doctype, just the email <body>. If the user requests changes that need refactoring the whole HTML structure of the email, you can do so as long as the appearance stays the same. For variables use double curly brackets with snake_case like {{variable_name}}";

  const result = await generateText({
    model: anthropic("claude-3-haiku-20240307"),
    system: payload.currentHtml ? EDIT_PROMPT : INITIAL_GENERATION_PROMPT,
    messages: [
      {
        role: "user",
        content: payload.currentHtml
          ? `html:${payload.currentHtml}\nprompt:${payload.prompt}`
          : `${payload.prompt}`,
      },
    ],
  });

  return {
    code: result.text,
  };
});

export const editTemplateElement = action(async (formData: FormData) => {
  "use server";

  requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      element: string(),
      prompt: string(),
    }),
    values
  );

  const result = await generateText({
    model: anthropic("claude-3-haiku-20240307"),
    system:
      "You are an HTML email editor. You will be give a piece of HTML code taken from an email and the user's prompt. Your task is to apply the changes required by the user to that HTML and return the result. Make sure to only return HTML, no backticks, no markdown, just the modified HTML. Remember that HTML must be old e-mail compatible, so use tables for layouts instead of divs. Make sure that HTML attributes like align and bgcolor are applied both as attributes AND as inline styles to make the HTML compatible with as many email clients as possible. Remember the <style> tag doesn't work in email clients, so use inline styles on the elements instead.",
    messages: [
      {
        role: "user",
        content: `html:${payload.element}\nprompt:${payload.prompt}`,
      },
    ],
  });

  return {
    code: result.text,
  };
});

export const deleteTemplate = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const payload = await parseAsync(
    object({
      projectId: string(),
      id: string(),
    }),
    values
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: payload.projectId,
  });

  await db
    .delete(schema.templatesTable)
    .where(
      and(
        eq(schema.templatesTable.id, payload.id),
        eq(schema.templatesTable.projectId, payload.projectId)
      )
    );

  throw redirect("..");
}, "templates");
