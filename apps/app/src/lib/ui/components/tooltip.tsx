import {
	type JSX,
	splitProps,
	type Component,
	type ValidComponent,
} from "solid-js";
import * as TooltipPrimitive from "@kobalte/core/tooltip";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";

import { cn } from "../utils/cn";

const TooltipTrigger = TooltipPrimitive.Trigger;

const Tooltip: Component<TooltipPrimitive.TooltipRootProps> = (props) => {
	return <TooltipPrimitive.Root gutter={0} {...props} />;
};

type TooltipContentProps<T extends ValidComponent = "div"> =
	TooltipPrimitive.TooltipContentProps<T> & { class?: string | undefined };

const TooltipContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TooltipContentProps<T>>,
) => {
	const [local, others] = splitProps(
		props as TooltipContentProps & {
			children?: JSX.Element;
		},
		["class", "children"],
	);

	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				class={cn(
					"z-50 origin-[var(--kb-popover-content-transform-origin)] rounded-md border bg-white px-2 py-1 text-black shadow-md animate-in fade-in-0 zoom-in-95 text-xs",
					local.class,
				)}
				{...others}
			>
				<TooltipPrimitive.Arrow />
				{local.children}
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
};

export { Tooltip, TooltipTrigger, TooltipContent };
