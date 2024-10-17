import {
	ColorPicker,
	type ColorPickerRootProps,
	type ColorPickerValueChangeDetails,
	parseColor,
} from "@ark-ui/solid";
import { PipetteIcon } from "lucide-solid";
import { type JSXElement, Show, splitProps } from "solid-js";
import { tv } from "tailwind-variants";
import { Button } from "./button";
import { Label } from "./label";

const styles = tv({
	slots: {
		container: "inline-flex flex-col gap-1 ",
		control: "flex gap-2 items-center",
		input:
			"rounded-lg min-w-0 outline-none border border-gray-200 bg-white text-sm px-2 py-1",
		trigger: "p-1 bg-white border border-gray-200 rounded-lg",
		valueSwatch: "size-5 rounded",
		content:
			"z-50 shadow-lg bg-white border space-y-2 border-gray-200 p-2 rounded-lg",
		areaBackground: "size-48 rounded",
		areaThumb: "size-4 rounded-full bg-white border border-gray-200",
		eyeDropperTrigger: "p-1",
		channelSliderContainer: "grow",
		channelSliderTrack: "w-full h-4 border border-white rounded",
		channelSliderThumb:
			"border border-white rounded w-4 -translate-x-1/2 h-5 -translate-y-1/2 shadow",
	},
});

type Props = Omit<ColorPickerRootProps, "onChange"> & {
	label?: JSXElement;
	hint?: JSXElement;
	defaultColor?: string;
	onChange?: (value: string) => void;
	classes?: {
		container?: string;
		label?: string;
		control?: string;
		input?: string;
		trigger?: string;
		valueSwatch?: string;
		content?: string;
		areaBackground?: string;
		areaThumb?: string;
		eyeDropperTrigger?: string;
		channelSliderContainer?: string;
		channelSliderTrack?: string;
		channelSliderThumb?: string;
	};
};

export function ColorInput(props: Props) {
	const [local, rest] = splitProps(props, [
		"label",
		"classes",
		"hint",
		"defaultColor",
		"onChange",
	]);

	function handleValueChange(details: ColorPickerValueChangeDetails) {
		local.onChange?.(details.value.toString("hex"));
	}

	return (
		<ColorPicker.Root
			{...rest}
			defaultValue={
				local.defaultColor ? parseColor(local.defaultColor) : undefined
			}
			onValueChange={handleValueChange}
		>
			<Show when={local.label}>
				<ColorPicker.Label
					asChild={(labelProps) => (
						<Label {...labelProps} class={local.classes?.label}>
							{local.label}
						</Label>
					)}
				/>
			</Show>
			<ColorPicker.Control
				class={styles().control({ class: local?.classes?.control })}
			>
				<ColorPicker.ChannelInput
					class={styles().input({ class: local?.classes?.input })}
					channel="hex"
				/>
				<ColorPicker.Trigger
					class={styles().trigger({ class: local?.classes?.trigger })}
				>
					<ColorPicker.ValueSwatch
						class={styles().valueSwatch({ class: local?.classes?.valueSwatch })}
					/>
				</ColorPicker.Trigger>
			</ColorPicker.Control>
			<ColorPicker.Positioner>
				<ColorPicker.Content
					class={styles().content({ class: local?.classes?.content })}
				>
					<ColorPicker.Area>
						<ColorPicker.AreaBackground
							class={styles().areaBackground({
								class: local?.classes?.areaBackground,
							})}
						/>
						<ColorPicker.AreaThumb
							class={styles().areaThumb({ class: local?.classes?.areaThumb })}
						/>
					</ColorPicker.Area>
					<div class="flex gap-2 items-center">
						<ColorPicker.EyeDropperTrigger
							asChild={(props) => (
								<Button
									variant="outline"
									{...props}
									even
									class={styles().eyeDropperTrigger({
										class: local?.classes?.eyeDropperTrigger,
									})}
								>
									<PipetteIcon class="size-4" />
								</Button>
							)}
						/>
						<ColorPicker.ChannelSlider
							channel="hue"
							class={styles().channelSliderContainer({
								class: local?.classes?.channelSliderContainer,
							})}
						>
							<ColorPicker.ChannelSliderTrack
								class={styles().channelSliderTrack({
									class: local?.classes?.channelSliderTrack,
								})}
							/>
							<ColorPicker.ChannelSliderThumb
								class={styles().channelSliderThumb({
									class: local?.classes?.channelSliderThumb,
								})}
							/>
						</ColorPicker.ChannelSlider>
					</div>
				</ColorPicker.Content>
			</ColorPicker.Positioner>
			<ColorPicker.HiddenInput />
		</ColorPicker.Root>
	);
}
