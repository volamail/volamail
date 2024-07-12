import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { eq } from "drizzle-orm";
import { teamsTable } from "../db/schema";
import { db } from "../db";
import { env } from "../environment/env";

export const llms = {
  "claude-3-haiku-20240307": createAnthropicModel("claude-3-haiku-20240307"),
  "claude-3-sonnet-20240229": createAnthropicModel("claude-3-sonnet-20240229"),
  "claude-3-5-sonnet-20240620": createAnthropicModel(
    "claude-3-5-sonnet-20240620"
  ),
  "claude-3-opus-20240229": createAnthropicModel("claude-3-opus-20240229"),
  "gpt-4o": createOpenAIModel("gpt-4o"),
  "gpt-4-turbo": createOpenAIModel("gpt-4-turbo"),
  "gpt-3.5-turbo": createOpenAIModel("gpt-3.5-turbo"),
  "gpt-4": createOpenAIModel("gpt-4"),
  custom: createOpenAIModel(process.env.LLM as string),
} as const;

function createOpenAIModel(model: string) {
  return () =>
    createOpenAI({
      apiKey: env.LLM_API_KEY,
      baseUrl: env.LLM_BASE_URL,
    })(model);
}

function createAnthropicModel(model: string) {
  return () =>
    createAnthropic({
      apiKey: env.LLM_API_KEY,
    })(model);
}

export async function getModelForTeam(teamId: string) {
  if (env.VITE_SELF_HOSTED === "true") {
    return llms[env.LLM]();
  }

  const team = await db.query.teamsTable.findFirst({
    where: eq(teamsTable.id, teamId),
    with: {
      subscription: {
        columns: {
          tier: true,
        },
      },
    },
    columns: {},
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.subscription.tier === "FREE") {
    return llms["claude-3-haiku-20240307"]();
  }

  return llms["claude-3-sonnet-20240229"]();
}
