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
			<ArkSelect.Control className="min-w-24 flex gap-2 justify-between items-center ">
				<ArkSelect.Trigger
					className={cn(
						"outline-none focus-visible:ring-[1px] ring-primary-600 rounded-md text-sm grow flex gap-2 pl-2 pr-1.5 py-1.5 justify-between items-center border dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors",
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
					<ArkSelect.Content className="outline-none z-50 overflow-hidden rounded-md w-[var(--reference-width)] border shadow dark:bg-gray-800 dark:border-gray-700 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out">
						{collection.items.map((item) => (
							<ArkSelect.Item
								key={item.value}
								item={item}
								className={cn(
									"flex gap-2 cursor-default justify-between text-sm px-2 py-1.5 items-center data-[highlighted]:dark:bg-gray-700",
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
