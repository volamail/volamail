import { ActionButton } from "@/modules/ui/components/action-button";
import { Menu, MenuItem } from "@/modules/ui/components/menu";
import { cn } from "@/modules/ui/utils/cn";
import type { MenuSelectionDetails } from "@ark-ui/react";
import { EllipsisVerticalIcon, ReplaceIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { TemplateLanguage } from "../languages";
import { useEditorStore } from "../store";
import { TemplateLanguageIcon } from "./template-language-icon";

interface LocaleProps {
	lang: TemplateLanguage;
	label: string;
	default?: boolean;
}

export const LocaleTabItem = observer(function LocaleTabItem(
	props: LocaleProps,
) {
	const store = useEditorStore();

	const active = store.template.currentLanguage === props.lang;

	function handleMenuSelect(details: MenuSelectionDetails) {
		if (details.value === "delete") {
			store.template.removeTranslation(props.lang);
		} else if (details.value === "set-as-default") {
			store.template.setDefaultTranslation(props.lang);
		}
	}

	return (
		<li
			className={cn(
				"inline-flex items-center gap-2 border-b p-2.5 text-gray-500 text-sm transition-colors last:border-b-0 dark:border-gray-700",
				active && "bg-gray-800 text-white",
			)}
		>
			<button
				type="button"
				className="inline-flex grow items-center gap-2 rounded-md outline-none ring-primary-600 transition-colors focus-visible:ring-[1px] dark:focus-visible:text-gray-50 dark:hover:text-gray-50"
				onClick={() => store.template.changeCurrentLanguage(props.lang)}
			>
				<TemplateLanguageIcon lang={props.lang} className="size-6" />

				<span className="grow text-left text-sm">
					{props.label}{" "}
					<span className="text-gray-500 text-xs">{props.lang}</span>
				</span>
				{props.default && (
					<span className="rounded-full px-1.5 text-xs dark:bg-primary-900 dark:text-primary-400">
						Default
					</span>
				)}
			</button>
			<div className="flex items-center justify-end gap-2">
				{!props.default && (
					<Menu
						onSelect={handleMenuSelect}
						trigger={
							<ActionButton
								variant="ghost"
								padding="sm"
								color="neutral"
								className="[&:hover:not(:disabled)]:dark:bg-gray-600"
							>
								<EllipsisVerticalIcon className="size-4" />
							</ActionButton>
						}
					>
						<MenuItem value="set-as-default">
							<ReplaceIcon className="size-4" />
							Set as default
						</MenuItem>

						<MenuItem value="delete" className="dark:text-red-500">
							<XIcon className="size-4" />
							Delete
						</MenuItem>
					</Menu>
				)}
			</div>
		</li>
	);
});
