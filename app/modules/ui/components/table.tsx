import type { ComponentProps } from "react";
import { cn } from "../utils/cn";

export function Table({ className, ...props }: ComponentProps<"table">) {
	return (
		<table
			className={cn(
				"border-separate border-spacing-0 rounded-lg border dark:border-gray-700 dark:bg-gray-900",
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
				"p-2.5 text-gray-800 text-sm dark:text-gray-200",
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
				"border-b p-2.5 text-left font-medium text-gray-500 text-xs dark:border-gray-700 dark:text-gray-400",
				className,
			)}
			{...props}
		/>
	);
}
