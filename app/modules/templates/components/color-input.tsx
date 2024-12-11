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

const styles = tv({
	slots: {
		container: "flex gap-3 items-center",
		control:
			"min-w-0 flex gap-2 has-[:focus]:ring-[1px] ring-primary-600 items-center border border-gray-20 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-md py-1 px-1.5",
		input: "min-w-0 grow outline-none text-sm bg-transparent",
		trigger: "rounded-lg bg-gray-900 p-1",
		valueSwatch: "size-3 rounded",
		content:
			"z-50 shadow-lg bg-white border space-y-2 border-gray-200 p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700",
		areaBackground: "size-48 rounded",
		areaThumb: "size-4 rounded-full bg-white border border-gray-200",
		eyeDropperTrigger: "p-1",
		channelSliderContainer: "grow",
		channelSliderTrack: "w-full h-4 border border-white rounded",
		channelSliderThumb:
			"border border-white rounded w-4 -translate-x-1/2 h-5 -translate-y-1/2 shadow",
	},
});

type Props = Omit<ColorPickerRootProps, "onChange" | "defaultValue"> & {
	label?: ReactNode;
	defaultValue?: string;
	onChange?: (value: string) => void;
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
	const { classes, defaultValue, onChange, label, ...rest } = props;

	function handleValueChange(details: ColorPickerValueChangeDetails) {
		onChange?.(details.value.toString("hex"));
	}

	return (
		<ColorPicker.Root
			{...rest}
			className={styles().container({ class: classes?.container })}
			defaultValue={defaultValue ? parseColor(defaultValue) : undefined}
			onValueChange={handleValueChange}
		>
			{label && (
				<ColorPicker.Label asChild>
					<Label className={classes?.label}>{label}</Label>
				</ColorPicker.Label>
			)}
			<ColorPicker.Control
				className={styles().control({ class: classes?.control })}
			>
				<ColorPicker.Trigger
					className={styles().trigger({ class: classes?.trigger })}
				>
					<ColorPicker.ValueSwatch
						className={styles().valueSwatch({ class: classes?.valueSwatch })}
					/>
				</ColorPicker.Trigger>
				<ColorPicker.ChannelInput
					className={styles().input({ class: classes?.input })}
					channel="hex"
				/>
			</ColorPicker.Control>
			<ColorPicker.Positioner>
				<ColorPicker.Content
					className={styles().content({ class: classes?.content })}
				>
					<ColorPicker.Area>
						<ColorPicker.AreaBackground
							className={styles().areaBackground({
								class: classes?.areaBackground,
							})}
						/>
						<ColorPicker.AreaThumb
							className={styles().areaThumb({
								class: classes?.areaThumb,
							})}
						/>
					</ColorPicker.Area>
					<div className="flex gap-2 items-center">
						<ColorPicker.EyeDropperTrigger asChild>
							<ActionButton
								variant="outline"
								className={styles().eyeDropperTrigger({
									class: classes?.eyeDropperTrigger,
								})}
							>
								<PipetteIcon className="size-4" />
							</ActionButton>
						</ColorPicker.EyeDropperTrigger>
						<ColorPicker.ChannelSlider
							channel="hue"
							className={styles().channelSliderContainer({
								class: classes?.channelSliderContainer,
							})}
						>
							<ColorPicker.ChannelSliderTrack
								className={styles().channelSliderTrack({
									class: classes?.channelSliderTrack,
								})}
							/>
							<ColorPicker.ChannelSliderThumb
								className={styles().channelSliderThumb({
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
