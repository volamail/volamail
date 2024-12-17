import { Button } from "@/modules/ui/components/button";
import { Portal, Select, createListCollection } from "@ark-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { TEMPLATE_LANGUAGES_MAP, type TemplateLanguage } from "../languages";
import { useEditorStore } from "../store";
import { LocaleTabItem } from "./locale-tab-item";
import { TemplateLanguageIcon } from "./template-language-icon";

export const LocalesTab = observer(() => {
	const store = useEditorStore();

	const availableLanguagesCollection = createListCollection({
		items: store.template.availableLanguages.map((lang) => ({
			value: lang,
			label: TEMPLATE_LANGUAGES_MAP[lang].label,
		})),
	});

	return (
		<div className="flex flex-col gap-2 overflow-hidden">
			<ul className="flex flex-col overflow-hidden rounded-lg border bg-gray-800/50 dark:border-gray-700">
				{store.template.sortedTranslations.map((translation) => (
					<LocaleTabItem
						key={translation.language}
						lang={translation.language}
						label={TEMPLATE_LANGUAGES_MAP[translation.language].label}
						default={
							store.template.defaultTranslation.language ===
							translation.language
						}
					/>
				))}
			</ul>

			{availableLanguagesCollection.items.length > 0 && (
				<Select.Root
					collection={availableLanguagesCollection}
					value={[]}
					onValueChange={(details) => {
						const [lang] = details.value;

						store.template.addTranslation(lang as TemplateLanguage);
					}}
				>
					<Select.Control>
						<Select.Trigger asChild>
							<Button
								color="neutral"
								className="w-full justify-between font-normal"
							>
								<Select.ValueText
									placeholder="Add translation..."
									className="dark:text-gray-400"
								/>
								<Select.Indicator>
									<ChevronDownIcon className="size-4" />
								</Select.Indicator>
							</Button>
						</Select.Trigger>
					</Select.Control>
					<Portal>
						<Select.Positioner>
							<Select.Content className="data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 data-[state=closed]:fade-out w-[var(--reference-width)] overflow-hidden rounded-lg border shadow-xl data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-gray-700 dark:bg-gray-800">
								{availableLanguagesCollection.items.map((item) => (
									<Select.Item
										key={item.value}
										item={item}
										className="flex cursor-default items-center gap-2 border-b p-2.5 text-sm transition-colors last:border-b-0 data-[highlighted]:bg-gray-700 dark:border-gray-700"
									>
										<TemplateLanguageIcon lang={item.value} />
										<Select.ItemText>{item.label}</Select.ItemText>
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
					</Portal>
				</Select.Root>
			)}
		</div>
	);
});
