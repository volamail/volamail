import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import * as PopoverPrimitive from "@kobalte/core/popover";
import { type ValidComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

export const PopoverRoot = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

type PopoverContentProps<T extends ValidComponent = "div"> = PolymorphicProps<
	T,
	PopoverPrimitive.PopoverContentProps
>;

export function PopoverContent(props: PopoverContentProps) {
	const [local, others] = splitProps(props, ["class", "children"]);

	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				{...others}
				class={twMerge(
					"z-10 shadow-lg rounded-md p-2 border border-gray-200 bg-white data-[expanded]:animate-in data-[expanded]:fade-in data-[closed]:animate-out data-[closed]:fade-out",
					local.class,
				)}
			>
				<PopoverPrimitive.Arrow />
				{local.children}
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	);
}
