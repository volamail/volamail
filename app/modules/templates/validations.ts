import { z } from "zod";
import { validTemplateLanguage } from "./languages";

export const validTranslationInput = z.object({
	subject: z.string(),
	contents: z.any(),
	language: validTemplateLanguage,
});

export const validTheme = z.object({
	background: z.string(),
	contentBackground: z.string(),
	contentMaxWidth: z.number(),
	contentBorderRadius: z.coerce.number().min(0),
	contentBorderWidth: z.coerce.number().min(0),
	contentBorderColor: z.string(),
});
