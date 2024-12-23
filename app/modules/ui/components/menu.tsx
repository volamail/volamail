import {
	Menu as ArkMenu,
	type MenuRootProps,
	type MenuSelectionDetails,
	Portal,
} from "@ark-ui/react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

interface Props {
	placement?: NonNullable<MenuRootProps["positioning"]>["placement"];
	children: ReactNode | ReactNode[];
	trigger: ReactNode;
	onSelect?: (details: MenuSelectionDetails) => void;
}

export function Menu(props: Props) {
	return (
		<ArkMenu.Root
			positioning={{
				offset: { mainAxis: 4, crossAxis: 0 },
				placement: props.placement,
			}}
			onSelect={props.onSelect}
		>
			<ArkMenu.Trigger asChild>{props.trigger}</ArkMenu.Trigger>

			<Portal>
				<ArkMenu.Positioner>
					<ArkMenu.Content className="z-10 space-y-0.5 rounded-md border p-1 text-sm shadow-2xl outline-none dark:border-gray-800 dark:bg-gray-900">
						{props.children}
					</ArkMenu.Content>
				</ArkMenu.Positioner>
			</Portal>
		</ArkMenu.Root>
	);
}

interface MenuItemProps {
	children: ReactNode;
	value: string;
	className?: string;
	disabled?: boolean;
}

export function MenuItem(props: MenuItemProps) {
	return (
		<ArkMenu.Item
			disabled={props.disabled}
			value={props.value}
			className={cn(
				"flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors data-[disabled]:opacity-50 dark:text-gray-400 data-[highlighted]:dark:bg-gray-800",
				props.className,
			)}
		>
			{props.children}
		</ArkMenu.Item>
	);
}
