import { ActionButton } from "@/modules/ui/components/action-button";
import { cn } from "@/modules/ui/utils/cn";
import type { ComponentProps } from "react";

export function BubbleMenuButton({
	className,
	active,
	...props
}: ComponentProps<typeof ActionButton> & {
	active?: boolean;
}) {
	return (
		<ActionButton
			color="neutral"
			className={cn(
				"rounded border-none p-1.5 dark:bg-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
				active && "dark:bg-gray-700 dark:text-gray-300",
				className,
			)}
			{...props}
		/>
	);
}
