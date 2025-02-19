import { TEMPLATE_LANGUAGES } from "@/modules/templates/languages";
import { pgEnum } from "drizzle-orm/pg-core";

export const templateLanguages = pgEnum(
	"template_languages",
	TEMPLATE_LANGUAGES,
);
