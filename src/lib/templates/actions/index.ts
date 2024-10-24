import { action } from "@solidjs/router";
import { createTemplate as createTemplateAction } from "./createTemplate";
import { upsertTemplateTranslation as upsertTemplateTranslationAction } from "./upsertTemplateTranslation";

export const createTemplate = action(createTemplateAction);

export const upsertTemplateTranslation = action(
	upsertTemplateTranslationAction,
);
