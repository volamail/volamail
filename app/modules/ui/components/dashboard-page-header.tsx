import type { ComponentProps, ReactNode } from "react";
import { tv } from "tailwind-variants";

interface Props extends Omit<ComponentProps<"div">, "title"> {
	title: ReactNode;
	description?: ReactNode;
	trailing?: ReactNode;
}

const styles = tv({
	base: "flex items-start",
	slots: {
		title: "inline-flex items-center gap-3 font-medium text-2xl",
		description: "text-gray-500 text-sm",
	},
});

export function DashboardPageHeader(props: Props) {
	const { title, description, trailing, className, ...rest } = props;

	return (
		<div className={styles().base({ className })} {...rest}>
			<div className="flex grow flex-col gap-1">
				<h1 className={styles().title()}>{title}</h1>
				{description && <p className={styles().description()}>{description}</p>}
			</div>
			{trailing}
		</div>
	);
}
