import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

interface Props {
	title: ReactNode;
	description: ReactNode;
	children?: ReactNode | ReactNode[];
}

const styles = tv({
	base: "flex flex-col items-center gap-8 rounded-lg border border-dashed p-4 py-16 text-center dark:border-gray-700 dark:bg-gray-900",
	slots: {
		header: "flex flex-col items-center gap-2",
		title: "dark:text-gray-50",
		description: "max-w-xs text-sm dark:text-gray-400",
	},
});

export function EmptyState(props: Props) {
	return (
		<div className={styles().base()}>
			<div className={styles().header()}>
				<h4 className={styles().title()}>{props.title}</h4>
				<p className={styles().description()}>{props.description}</p>
			</div>
			{props.children}
		</div>
	);
}
