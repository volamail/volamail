import { type TabContentProps, Tabs } from "@ark-ui/solid";
import { LanguagesIcon, PaletteIcon } from "lucide-solid";
import { For } from "solid-js";
import type { TemplateLanguage } from "~/lib/templates/languages";
import type { Theme } from "~/lib/templates/theme";
import { I18nTab } from "./i18n-tab";
import { ThemeTab } from "./theme-tab";

const TABS = [
	{
		label: "Theme",
		value: "theme",
		Icon: PaletteIcon,
	},
	{
		label: "I18n",
		value: "i18n",
		Icon: LanguagesIcon,
	},
];

type SidebarProps = {
	projectId: string;
	templateSlug?: string;
	isEditing: boolean;
	i18n: {
		defaultLanguage: TemplateLanguage;
		languages: Array<TemplateLanguage>;
	};
	theme: {
		theme: Theme;
		onUpdate: (theme: Partial<Theme>) => void;
	};
};

export function Sidebar(props: SidebarProps) {
	return (
		<Tabs.Root
			deselectable
			orientation="vertical"
			class="shrink-0 flex -ml-8 -mr-52 has-[[data-state=open]]:mr-0 transition-all z-50"
		>
			<Tabs.List class="relative self-center flex flex-col items-center">
				<For each={TABS}>
					{(tab) => (
						<Tabs.Trigger
							value={tab.value}
							class="peer p-2 border-l border-b first:border-t first:rounded-tl-lg last:rounded-bl-lg cursor-default bg-gray-100 hover:bg-gray-200 hover:text-gray-500 transition-colors text-gray-400 border-gray-300 data-[selected]:text-black data-[selected]:bg-white"
						>
							<tab.Icon class="size-4" />
							<span class="sr-only">{tab.label}</span>
						</Tabs.Trigger>
					)}
				</For>
			</Tabs.List>
			<TabsContent value="i18n">
				<I18nTab
					projectId={props.projectId}
					templateSlug={props.templateSlug}
					isEditing={props.isEditing}
					defaultLanguage={props.i18n.defaultLanguage}
					templateLanguages={props.i18n.languages}
				/>
			</TabsContent>
			<TabsContent value="theme">
				<ThemeTab theme={props.theme.theme} onUpdate={props.theme.onUpdate} />
			</TabsContent>
			<div class="w-52 h-full peer-[[data-state=open]]:hidden" />
		</Tabs.Root>
	);
}

function TabsContent(props: TabContentProps) {
	return (
		<Tabs.Content
			class="peer w-52 bg-gray-100 border-l border-gray-200"
			{...props}
		/>
	);
}
