import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

interface Props {
	title: ReactNode;
	description: ReactNode;
	children?: ReactNode | ReactNode[];
}

const styles = tv({
	base: "rounded-lg border border-dashed dark:border-gray-700 text-center dark:bg-gray-900 p-4 flex flex-col gap-8 items-center py-16",
	slots: {
		header: "flex flex-col gap-2 items-center",
		title: "dark:text-gray-50",
		description: "dark:text-gray-400 text-sm max-w-xs",
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
