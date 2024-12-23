import {
	Select as ArkSelect,
	Portal,
	type SelectValueChangeDetails,
	createListCollection,
} from "@ark-ui/react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { type ReactNode, useCallback } from "react";
import { cn } from "../utils/cn";

interface SelectProps {
	placeholder?: string;
	items: Array<{
		value: string;
		label: ReactNode;
	}>;
	defaultValue?: Array<string>;
	multiple?: boolean;
	onChange?: (value: Array<string>) => void;
	classes?: {
		container?: string;
		trigger?: string;
		item?: string;
	};
}

export function Select(props: SelectProps) {
	const collection = createListCollection({
		items: props.items,
	});

	const handleChange = useCallback(
		(details: SelectValueChangeDetails) => {
			props.onChange?.(details.value);
		},
		[props.onChange],
	);

	return (
		<ArkSelect.Root
			collection={collection}
			defaultValue={props.defaultValue}
			multiple={props.multiple}
			onValueChange={handleChange}
			className={props.classes?.container}
		>
			<ArkSelect.Control className="flex min-w-24 items-center justify-between gap-2 ">
				<ArkSelect.Trigger
					className={cn(
						"flex grow items-center justify-between gap-2 rounded-md border py-1.5 pr-1.5 pl-2 text-sm outline-none ring-primary-600 transition-colors focus-visible:ring-[1px] dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700",
						props.classes?.trigger,
					)}
				>
					<ArkSelect.ValueText placeholder={props.placeholder} />
					<ArkSelect.Indicator>
						<ChevronsUpDownIcon className="size-4 dark:text-gray-400" />
					</ArkSelect.Indicator>
				</ArkSelect.Trigger>
			</ArkSelect.Control>
			<Portal>
				<ArkSelect.Positioner>
					<ArkSelect.Content className="z-50 w-[var(--reference-width)] overflow-hidden rounded-md border shadow outline-none dark:border-gray-700 dark:bg-gray-800">
						{collection.items.map((item) => (
							<ArkSelect.Item
								key={item.value}
								item={item}
								className={cn(
									"flex cursor-default items-center justify-between gap-2 px-2 py-1.5 text-sm data-[highlighted]:dark:bg-gray-700",
									props.classes?.item,
								)}
							>
								<ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>

								<ArkSelect.ItemIndicator>
									<CheckIcon className="size-4 dark:text-gray-400" />
								</ArkSelect.ItemIndicator>
							</ArkSelect.Item>
						))}
					</ArkSelect.Content>
				</ArkSelect.Positioner>
			</Portal>
			<ArkSelect.HiddenSelect />
		</ArkSelect.Root>
	);
}
