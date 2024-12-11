import {
	Menu as ArkMenu,
	type MenuRootProps,
	type MenuSelectionDetails,
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
				offset: { mainAxis: 0, crossAxis: 0 },
				placement: props.placement,
			}}
			onSelect={props.onSelect}
		>
			<ArkMenu.Trigger asChild>{props.trigger}</ArkMenu.Trigger>
			<ArkMenu.Positioner>
				<ArkMenu.Content className="z-10 shadow outline-none space-y-0.5 dark:border-gray-800 text-sm border rounded-md dark:bg-gray-900 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-1">
					{props.children}
				</ArkMenu.Content>
			</ArkMenu.Positioner>
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
				"flex gap-2 data-[disabled]:opacity-50 items-center text-sm data-[highlighted]:dark:bg-gray-800/50 dark:text-gray-400 px-2.5 py-1.5 cursor-default transition-colors",
				props.className,
			)}
		>
			{props.children}
		</ArkMenu.Item>
	);
}
