import { For } from "solid-js";
import * as ToggleGroupPrimitive from "@kobalte/core/toggle-group";

import { buttonVariants } from "./button";

type Props = {
	items: Array<
		{
			label: string;
			value: string;
		} & ToggleGroupPrimitive.ToggleGroupItemProps
	>;
} & ToggleGroupPrimitive.ToggleGroupRootProps;

export function ToggleGroup(props: Props) {
	return (
		<ToggleGroupPrimitive.Root {...props} class="flex">
			<For each={props.items}>
				{(item) => (
					<ToggleGroupPrimitive.Item
						aria-label={item.label}
						{...item}
						class={buttonVariants({
							variant: "outline",
							even: true,
							class:
								"bg-white border border-l-0 first:border-l rounded-none first:rounded-l-md last:rounded-r-md data-[pressed]:bg-black text-black data-[pressed]:text-white p-1",
						})}
					/>
				)}
			</For>
		</ToggleGroupPrimitive.Root>
	);
}
