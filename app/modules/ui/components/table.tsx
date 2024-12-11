import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export function Table({ className, ...props }: ComponentProps<"table">) {
	return (
		<table
			className={cn(
				"rounded-lg border-separate border-spacing-0 dark:bg-gray-900 border dark:border-gray-700",
				className,
			)}
			{...props}
		/>
	);
}

export function TableHead(props: ComponentProps<"thead">) {
	return <thead {...props} />;
}

export function TableBody(props: ComponentProps<"tbody">) {
	return <tbody {...props} />;
}

export function TableRow(props: ComponentProps<"tr">) {
	return <tr {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
	return (
		<td
			className={cn(
				"text-sm p-2.5 text-gray-800 dark:text-gray-200",
				className,
			)}
			{...props}
		/>
	);
}

export function TableHeadCell({ className, ...props }: ComponentProps<"th">) {
	return (
		<th
			className={cn(
				"text-left p-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700",
				className,
			)}
			{...props}
		/>
	);
}
