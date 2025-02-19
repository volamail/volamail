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
					"pointer-events-none absolute inset-0 bg-gray-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-gray-950",
					classes?.background,
				)}
			/>
			{children}
		</div>
	);
}
