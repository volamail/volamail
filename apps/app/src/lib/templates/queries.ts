import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { cache } from "@solidjs/router";
import { createError } from "vinxi/http";

import { db } from "~/lib/db";
import * as schema from "~/lib/db/schema";
import { requireUser } from "../auth/utils";
import { getModelForTeam } from "./model";
import autocompletePrompt from "./prompts/autocomplete.txt?raw";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const getProjectTemplates = cache(async (projectId: string) => {
  "use server";

  const user = requireUser();

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId,
  });

  return await db.query.templatesTable.findMany({
    where: eq(schema.templatesTable.projectId, projectId),
    columns: {
      body: false,
    },
  });
}, "templates");

export const getTemplate = cache(async (id: string) => {
  "use server";

  const template = await db.query.templatesTable.findFirst({
    where: eq(schema.templatesTable.id, id),
  });

  if (!template) {
    throw createError({
      statusCode: 404,
      statusMessage: "Template not found",
    });
  }

  return template;
}, "templates");

export async function getTemplateGenerationAutocomplete(params: {
  query: string;
  projectId: string;
}) {
  "use server";

  const user = requireUser();

  const { meta } = await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: params.projectId,
  });

  const result = await generateText({
    model: await getModelForTeam({
      teamId: meta.project.team.id,
      tier: "small",
    }),
    system: autocompletePrompt,
    prompt: `Prompt: ${params.query}`,
  });

  return result.text;
}
