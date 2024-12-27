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
					type: "section",
					content: [
						{
							type: "paragraph",
							text: "My test content",
						},
					],
				},
			],
		},
		language,
	} satisfies Partial<DbTemplateTranslation>;
}
