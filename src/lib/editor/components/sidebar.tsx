import { type TabContentProps, Tabs } from "@ark-ui/solid";
import { LanguagesIcon, PaletteIcon } from "lucide-solid";
import { For } from "solid-js";
import type { Theme } from "~/lib/templates/theme";
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
	theme: Theme;
	onUpdate: (theme: Partial<Theme>) => void;
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
				<div class="flex gap-3 items-center px-4 h-14 border-b border-gray-200">
					<img
						alt="English"
						src="https://hatscripts.github.io/circle-flags/flags/us.svg"
						class="size-6 rounded-full"
					/>
					<span class="text-sm font-medium grow">English</span>
				</div>
			</TabsContent>
			<TabsContent value="theme">
				<ThemeTab theme={props.theme} onUpdate={props.onUpdate} />
			</TabsContent>
			<div class="w-52 h-full peer-[[data-state=open]]:hidden" />
		</Tabs.Root>
	);
}

function TabsContent(props: TabContentProps) {
	return (
		<Tabs.Content
			class="peer w-52 bg-gray-50 border-l border-gray-200"
			{...props}
		/>
	);
}
