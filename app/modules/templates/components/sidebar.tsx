import { Tabs } from "@ark-ui/react";
import { LanguagesIcon, PaletteIcon } from "lucide-react";
import { LocalesTab } from "./locales-tab";
import { ThemeTab } from "./theme-tab";

export function Sidebar() {
	return (
		<div className="w-60 border-r p-3 dark:border-gray-800">
			<Tabs.Root defaultValue="theme" className="flex flex-col gap-3">
				<div className="flex justify-center">
					<Tabs.List className="flex w-full rounded-lg bg-gray-800/50 p-1">
						<Tabs.Indicator className="z-0 h-[var(--height)] w-[var(--width)] rounded-md border border-gray-700 bg-gray-700/50" />
						<Tabs.Trigger
							value="theme"
							className="z-10 inline-flex grow items-center justify-center gap-2 px-3 py-1.5 text-gray-500 text-sm transition-colors data-[selected]:text-gray-50 hover:dark:text-gray-400"
						>
							Theme
							<PaletteIcon className="size-4" />
						</Tabs.Trigger>
						<Tabs.Trigger
							value="locales"
							className="z-10 inline-flex grow items-center justify-center gap-2 px-3 py-1.5 text-gray-500 text-sm transition-colors data-[selected]:text-gray-50 hover:dark:text-gray-400"
						>
							Locale
							<LanguagesIcon className="size-4" />
						</Tabs.Trigger>
					</Tabs.List>
				</div>
				<Tabs.Content value="theme">
					<ThemeTab />
				</Tabs.Content>
				<Tabs.Content value="locales">
					<LocalesTab />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
