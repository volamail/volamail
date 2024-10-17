import { literal, union } from "valibot";

export const TEMPLATE_LANGUAGES = ["en", "it"] as const;

export type TemplateLanguage = (typeof TEMPLATE_LANGUAGES)[number];

export const validTemplateLanguage = union(
	TEMPLATE_LANGUAGES.map((language) => literal(language)),
);
