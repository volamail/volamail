import { ActionButton } from "@/modules/ui/components/action-button";
import { Label } from "@/modules/ui/components/label";

import {
	ColorPicker,
	type ColorPickerRootProps,
	type ColorPickerValueChangeDetails,
	parseColor,
} from "@ark-ui/react";
import { PipetteIcon } from "lucide-react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

export const colorInputStyles = tv({
	slots: {
		container: "flex items-center gap-3",
		control:
			"flex min-w-0 items-center gap-2 rounded-md border border-gray-20 bg-white px-1.5 py-1 ring-primary-600 has-[:focus]:ring-[1px] dark:border-gray-700 dark:bg-gray-800",
		input: "min-w-0 grow bg-transparent text-sm outline-none",
		trigger: "rounded-lg bg-gray-900 p-1",
		valueSwatch: "size-3 rounded",
		content:
			"z-50 space-y-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800",
		areaBackground: "size-48 rounded",
		areaThumb: "size-4 rounded-full border border-gray-200 bg-white",
		eyeDropperTrigger: "p-1",
		channelSliderContainer: "grow",
		channelSliderTrack: "h-4 w-full rounded border border-white",
		channelSliderThumb:
			"-translate-x-1/2 -translate-y-1/2 h-5 w-4 rounded border border-white shadow",
	},
});

type Props = Omit<ColorPickerRootProps, "onChange" | "defaultValue"> & {
	label?: ReactNode;
	defaultValue?: string;
	onChange?: (value: string) => void;
	showInput?: boolean;
	classes?: {
		label?: string;
		container?: string;
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
	const {
		classes,
		defaultValue,
		onChange,
		label,
		showInput = true,
		...rest
	} = props;

	function handleValueChange(details: ColorPickerValueChangeDetails) {
		onChange?.(details.value.toString("hex"));
	}

	return (
		<ColorPicker.Root
			{...rest}
			className={colorInputStyles().container({ class: classes?.container })}
			defaultValue={defaultValue ? parseColor(defaultValue) : undefined}
			onValueChange={handleValueChange}
		>
			{label && (
				<ColorPicker.Label asChild>
					<Label className={classes?.label}>{label}</Label>
				</ColorPicker.Label>
			)}
			<ColorPicker.Control
				className={colorInputStyles().control({ class: classes?.control })}
			>
				<ColorPicker.Trigger
					className={colorInputStyles().trigger({ class: classes?.trigger })}
				>
					<ColorPicker.ValueSwatch
						className={colorInputStyles().valueSwatch({
							class: classes?.valueSwatch,
						})}
					/>
				</ColorPicker.Trigger>
				{showInput && (
					<ColorPicker.ChannelInput
						className={colorInputStyles().input({ class: classes?.input })}
						channel="hex"
					/>
				)}
			</ColorPicker.Control>
			<ColorPicker.Positioner>
				<ColorPicker.Content
					className={colorInputStyles().content({ class: classes?.content })}
				>
					<ColorPicker.Area>
						<ColorPicker.AreaBackground
							className={colorInputStyles().areaBackground({
								class: classes?.areaBackground,
							})}
						/>
						<ColorPicker.AreaThumb
							className={colorInputStyles().areaThumb({
								class: classes?.areaThumb,
							})}
						/>
					</ColorPicker.Area>
					<div className="flex items-center gap-2">
						<ColorPicker.EyeDropperTrigger asChild>
							<ActionButton
								variant="outline"
								className={colorInputStyles().eyeDropperTrigger({
									class: classes?.eyeDropperTrigger,
								})}
							>
								<PipetteIcon className="size-4" />
							</ActionButton>
						</ColorPicker.EyeDropperTrigger>
						<ColorPicker.ChannelSlider
							channel="hue"
							className={colorInputStyles().channelSliderContainer({
								class: classes?.channelSliderContainer,
							})}
						>
							<ColorPicker.ChannelSliderTrack
								className={colorInputStyles().channelSliderTrack({
									class: classes?.channelSliderTrack,
								})}
							/>
							<ColorPicker.ChannelSliderThumb
								className={colorInputStyles().channelSliderThumb({
									class: classes?.channelSliderThumb,
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
