import { createEffect, createSignal, splitProps } from "solid-js";
import { PipetteIcon } from "lucide-solid";
import { ColorPicker as ArkColorPicker } from "@ark-ui/solid";

import { Button, type ButtonProps } from "~/lib/ui/components/button";

type Props = {
	icon: ButtonProps["icon"];
	"aria-label": string;
	value?: string;
	name?: string;
	onChange?: (value: string) => void;
};

export default function ColorPicker(props: Props) {
	const [local, others] = splitProps(props, ["value", "name", "onChange"]);

	function handleChange(details: ArkColorPicker.ValueChangeDetails) {
		local.onChange?.(details.value.toString("hex"));
	}

	return (
		<ArkColorPicker.Root
			unmountOnExit
			lazyMount
			value={local.value || "#000000"}
			onValueChange={handleChange}
		>
			<ArkColorPicker.Control>
				<ArkColorPicker.Trigger
					asChild={(triggerProps) => (
						<Button
							{...triggerProps}
							{...others}
							even
							variant="outline"
							class="relative"
						>
							<div
								class="absolute -right-2.5 -bottom-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full size-3 border border-gray-300"
								style={{ background: local.value }}
							/>
						</Button>
					)}
				/>
			</ArkColorPicker.Control>
			<ArkColorPicker.Positioner>
				<ArkColorPicker.Content class="flex flex-col gap-2 border border-gray-300 bg-gray-100 z-50 rounded-lg shadow p-2">
					<ArkColorPicker.Area>
						<ArkColorPicker.AreaBackground class="w-full aspect-video" />
						<ArkColorPicker.AreaThumb class="size-3 rounded-full border shadow border-gray-300" />
					</ArkColorPicker.Area>
					<ArkColorPicker.ChannelSlider channel="hue" class="relative">
						<ArkColorPicker.ChannelSliderTrack class="h-4 rounded" />
						<ArkColorPicker.ChannelSliderThumb class="h-[150%] w-2 border border-white rounded -translate-y-1/2 shadow" />
					</ArkColorPicker.ChannelSlider>
					<div class="flex gap-1 items-center">
						<ArkColorPicker.EyeDropperTrigger
							asChild={(props) => (
								<Button
									{...props}
									even
									icon={() => <PipetteIcon class="size-4" />}
									variant="outline"
								/>
							)}
						/>
						<ArkColorPicker.View format="rgba">
							<ArkColorPicker.ChannelInput
								channel="hex"
								class="rounded-lg bg-white border text-sm px-2 py-1"
							/>
						</ArkColorPicker.View>
					</div>
				</ArkColorPicker.Content>
			</ArkColorPicker.Positioner>
			<ArkColorPicker.HiddenInput name={local.name} />
		</ArkColorPicker.Root>
	);
}
