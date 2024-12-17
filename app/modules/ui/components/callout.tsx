import {
	CircleAlertIcon,
	CircleCheckIcon,
	CircleXIcon,
	InfoIcon,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { type VariantProps, tv } from "tailwind-variants";

const styles = tv({
	slots: {
		container: "flex items-start gap-2 rounded-lg border px-3 py-2",
		icon: "mt-0.5 size-4 shrink-0",
		text: "text-sm",
	},
	variants: {
		variant: {
			error: {
				container: "dark:border-red-900 dark:bg-red-950 dark:text-red-400",
			},
			info: {
				container: "dark:border-blue-500 dark:bg-blue-900 dark:text-blue-500",
			},
			success: {
				container:
					"dark:border-green-500 dark:bg-green-900 dark:text-green-500",
			},
			warning: {
				container:
					"dark:border-yellow-500 dark:bg-yellow-900 dark:text-yellow-500",
			},
		},
	},
});

interface Props extends VariantProps<typeof styles> {
	children: ReactNode;
	className?: string;
}

const VARIANT_ICONS: Record<
	Exclude<VariantProps<typeof styles>["variant"], undefined>,
	ComponentType<{ className?: string }>
> = {
	error: CircleXIcon,
	info: InfoIcon,
	success: CircleCheckIcon,
	warning: CircleAlertIcon,
};

export function Callout(props: Props) {
	const { variant, children, className } = props;

	const Icon = VARIANT_ICONS[variant ?? "info"];

	return (
		<div className={styles().container({ variant, className })}>
			<Icon className={styles().icon({ variant })} />
			<p className={styles().text({ variant })}>{children}</p>
		</div>
	);
}
