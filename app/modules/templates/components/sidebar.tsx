import { Tabs } from "@ark-ui/react";
import { LanguagesIcon, PaletteIcon } from "lucide-react";
import { LocalesTab } from "./locales-tab";
import { ThemeTab } from "./theme-tab";

export function Sidebar() {
	return (
		<div className="w-60 border-r dark:border-gray-800 p-3">
			<Tabs.Root defaultValue="theme" className="flex flex-col gap-3">
				<div className="flex justify-center">
					<Tabs.List className="w-full flex bg-gray-800/50 rounded-lg p-1">
						<Tabs.Indicator className="bg-gray-700/50 border border-gray-700 w-[var(--width)] h-[var(--height)] rounded-md z-0" />
						<Tabs.Trigger
							value="theme"
							className="inline-flex gap-2 items-center justify-center grow z-10 transition-colors text-sm py-1.5 px-3 text-gray-500 data-[selected]:text-gray-50 hover:dark:text-gray-400"
						>
							Theme
							<PaletteIcon className="size-4" />
						</Tabs.Trigger>
						<Tabs.Trigger
							value="locales"
							className="inline-flex gap-2 items-center justify-center grow z-10 transition-colors text-sm py-1.5 px-3 text-gray-500 data-[selected]:text-gray-50 hover:dark:text-gray-400"
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
