export const TEMPLATE_LANGUAGES = ["en", "it"] as const;

export type TemplateLanguage = (typeof TEMPLATE_LANGUAGES)[number];
