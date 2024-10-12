import { CheckIcon, ChevronDown } from "lucide-solid";
import * as SelectPrimitive from "@kobalte/core/select";

import { buttonVariants } from "./button";

type Props<
	T extends {
		label: string;
		value: string;
	},
> = SelectPrimitive.SelectRootProps<T>;

export function Select<T extends { label: string; value: string }>(
	props: Props<T>,
) {
	return (
		<SelectPrimitive.Root
			optionValue="value"
			optionTextValue="label"
			disallowEmptySelection
			itemComponent={(props) => (
				<SelectPrimitive.Item
					item={props.item}
					class="data-[selected]:bg-gray-300 data-[highlighted]:bg-gray-100 px-2 py-0.5 text-sm outline-none rounded-md cursor-default flex gap-2 justify-between items-center"
				>
					<SelectPrimitive.ItemLabel class="pr-4">
						{props.item.rawValue.label}
					</SelectPrimitive.ItemLabel>
					<SelectPrimitive.ItemIndicator class="hidden data-[selected]:block">
						<CheckIcon class="size-4" />
					</SelectPrimitive.ItemIndicator>
				</SelectPrimitive.Item>
			)}
			{...props}
		>
			<SelectPrimitive.Trigger
				class={buttonVariants({
					round: false,
					variant: "outline",
					class: "border-gray-200 font-normal",
				})}
			>
				<SelectPrimitive.Value<{
					label: string;
				}> class="data-[placeholder-shown]:text-gray-500">
					{(state) => state.selectedOption()?.label}
				</SelectPrimitive.Value>
				<SelectPrimitive.Icon>
					<ChevronDown class="size-4" />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>
			<SelectPrimitive.Portal>
				<SelectPrimitive.Content class="z-10 w-full shadow max-h-96 overflow-y-auto min-w-32 rounded-md p-2 bg-white">
					<SelectPrimitive.Listbox class="flex flex-col gap-1 outline-none" />
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
