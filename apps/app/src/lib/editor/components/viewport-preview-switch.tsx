import { ToggleGroup } from "@ark-ui/solid";
import type { ToggleGroupValueChangeDetails } from "@ark-ui/solid";
import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-solid";
import { For, type Component } from "solid-js";
import type { Viewport } from "../types";

const VIEWPORT_ICONS: Record<Viewport, Component<{ class?: string }>> = {
	mobile: SmartphoneIcon,
	tablet: TabletIcon,
	desktop: MonitorIcon,
};

interface Props {
	value?: Viewport;
	onChange?: (value: Viewport) => void;
}

const VIEWPORTS: Viewport[] = ["mobile", "tablet", "desktop"];

export function ViewportPreviewSwitch(props: Props) {
	function handleChange(details: ToggleGroupValueChangeDetails) {
		const [viewport] = details.value;

		if (viewport) {
			props.onChange?.(viewport as Viewport);
		}
	}

	return (
		<ToggleGroup.Root
			value={[props.value || "desktop"]}
			onValueChange={handleChange}
			class="rounded-full overflow-hidden flex border border-gray-400"
		>
			<For each={VIEWPORTS}>
				{(viewport) => {
					const Icon = VIEWPORT_ICONS[viewport];

					return (
						<ToggleGroup.Item
							value={viewport}
							class="py-1 px-1.5 cursor-default hover:bg-gray-200 hover:text-gray-700 first:pl-2 last:pr-2 transition-colors bg-gray-100 text-gray-500 data-[state=on]:text-black data-[state=on]:bg-white border-r last:border-r-0 border-gray-300"
						>
							<Icon class="size-4" />
						</ToggleGroup.Item>
					);
				}}
			</For>
		</ToggleGroup.Root>
	);
}
