import {
	TooltipArrow,
	TooltipArrowTip,
	TooltipContent,
	TooltipPositioner,
	TooltipRoot,
	type TooltipRootProps,
	TooltipTrigger,
} from "@ark-ui/react";
import { cn } from "../utils/cn";

interface Props {
	children: React.ReactNode;
	content: React.ReactNode;
	className?: string;
	placement?: NonNullable<TooltipRootProps["positioning"]>["placement"];
}

export function Tooltip(props: Props) {
	if (props.content === null) {
		return props.children;
	}

	return (
		<TooltipRoot
			interactive
			openDelay={0}
			closeDelay={100}
			positioning={{
				placement: props.placement,
				offset: {
					crossAxis: 0,
					mainAxis: 2,
				},
			}}
		>
			<TooltipTrigger asChild>{props.children}</TooltipTrigger>
			<TooltipPositioner>
				<TooltipContent
					className={cn(
						"p-3 rounded-lg max-w-xs z-50 text-xs shadow border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out",
						props.className,
					)}
					style={{
						// @ts-expect-error - CSS custom properties
						"--arrow-size": "0.5rem",
						"--arrow-background": "currentColor",
					}}
				>
					<TooltipArrow className="dark:text-gray-800">
						<TooltipArrowTip />
					</TooltipArrow>
					{props.content}
				</TooltipContent>
			</TooltipPositioner>
		</TooltipRoot>
	);
}
