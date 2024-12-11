import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

interface Props extends ComponentProps<"div"> {
	classes?: {
		container?: string;
		background?: string;
	};
}

export function GridBgContainer(props: Props) {
	const { className, children, classes, ...rest } = props;

	return (
		<div
			className={cn(
				"relative bg-grid-small-black/50 dark:bg-grid-small-white/50",
				className,
				classes?.container,
			)}
			{...rest}
		>
			<div
				className={cn(
					"absolute pointer-events-none inset-0 dark:bg-gray-950 bg-gray-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]",
					classes?.background,
				)}
			/>
			{children}
		</div>
	);
}
