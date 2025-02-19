import type { ReactNode } from "react";
import { type VariantProps, tv } from "tailwind-variants";

const styles = tv({
	base: "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-normal text-xs",
	variants: {
		color: {
			red: "dark:bg-red-950 dark:text-red-400",
			green: "dark:bg-green-950 dark:text-green-400",
			blue: "dark:bg-blue-950 dark:text-blue-400",
			yellow: "dark:bg-yellow-950 dark:text-yellow-400",
			neutral: "dark:bg-gray-950 dark:text-gray-400",
		},
	},
});

interface Props extends VariantProps<typeof styles> {
	children: ReactNode;
	className?: string;
}

export function Badge(props: Props) {
	return <div className={styles(props)}>{props.children}</div>;
}
