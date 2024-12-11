import { cn } from "@/modules/ui/utils/cn";
import type { ComponentProps } from "react";
import { TEMPLATE_LANGUAGES_MAP, type TemplateLanguage } from "../languages";

interface Props extends ComponentProps<"img"> {
	lang: TemplateLanguage;
}

export function TemplateLanguageIcon(props: Props) {
	const { lang, className, ...rest } = props;

	const language = TEMPLATE_LANGUAGES_MAP[lang];

	return (
		// biome-ignore lint/a11y/useAltText: fuck off im literally using an alt text
		<img
			src={`https://hatscripts.github.io/circle-flags/flags/${language.flagCode}.svg`}
			className={cn("size-5", className)}
			alt={language.label}
			{...rest}
		/>
	);
}
