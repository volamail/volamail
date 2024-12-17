import {
	ProgressLabel,
	ProgressRange,
	ProgressRoot,
	ProgressTrack,
	ProgressValueText,
} from "@ark-ui/react";
import type { ComponentProps } from "react";
import { type VariantProps, tv } from "tailwind-variants";
import { cn } from "../utils/cn";

const styles = tv({
	slots: {
		root: "flex flex-col gap-2",
		track: "relative h-2 rounded-full dark:bg-gray-700",
		range: "h-full rounded-full",
		valueText: "self-end text-sm dark:text-gray-500",
		label: "font-medium text-sm dark:text-gray-50",
	},
	variants: {
		trend: {
			positive: {
				range: "bg-green-500",
			},
			neutral: {
				range: "bg-yellow-500",
			},
			negative: {
				range: "bg-red-500",
			},
		},
	},
});

type ProgressProps = VariantProps<typeof styles> &
	ComponentProps<typeof ProgressRoot> & {
		label: string;
		valueText: string;
		classes?: {
			root?: string;
			track?: string;
			range?: string;
			valueText?: string;
			label?: string;
		};
	};

export function Progress({
	trend,
	classes,
	className,
	label,
	valueText,
	...props
}: ProgressProps) {
	return (
		<ProgressRoot
			{...props}
			className={styles().root({
				className: cn(classes?.root, className),
				trend,
			})}
		>
			<ProgressLabel
				className={styles().label({ class: classes?.label, trend })}
			>
				{label}
			</ProgressLabel>
			<ProgressTrack
				className={styles().track({ class: classes?.track, trend })}
			>
				<ProgressRange
					className={styles().range({ class: classes?.range, trend })}
				/>
			</ProgressTrack>
			<ProgressValueText
				className={styles().valueText({ class: classes?.valueText, trend })}
			>
				{valueText}
			</ProgressValueText>
		</ProgressRoot>
	);
}
