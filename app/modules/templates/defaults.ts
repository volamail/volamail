import type { DbTemplateTranslation } from "../database/schema";
import type { TemplateLanguage } from "./languages";

export function getDummyTemplateTranslationForLanguage(
	language: TemplateLanguage,
) {
	return {
		subject: "My test subject",
		contents: {
			type: "doc",
			content: [
				{
					type: "paragraph",
				},
			],
		},
		language,
	} satisfies Partial<DbTemplateTranslation>;
}
