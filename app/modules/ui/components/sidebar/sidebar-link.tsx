import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { type VariantProps, tv } from "tailwind-variants";

const sidebarLinkStyles = tv({
	base: "inline-flex w-full items-center gap-2 rounded-md border border-transparent px-2.5 py-1.5 text-sm outline-none ring-primary-600 transition-colors focus-visible:ring-[1px]",
	variants: {
		state: {
			inactive: "dark:text-gray-500 dark:hover:bg-gray-900",
			active:
				"bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-white",
		},
		comingSoon: {
			false: "",
			true: "cursor-not-allowed dark:text-gray-500",
		},
	},
	slots: {
		text: "grow",
		comingSoonBadge:
			"inline-flex items-center gap-1 rounded-full bg-yellow-50 px-1.5 text-xs text-yellow-500 dark:bg-yellow-900 dark:text-yellow-400",
	},
	defaultVariants: {
		state: "inactive",
		comingSoon: false,
	},
});

type SidebarLinkProps = ComponentProps<typeof Link> &
	VariantProps<typeof sidebarLinkStyles> & {
		icon: React.ComponentType<{ className?: string }>;
		children: string;
		comingSoon?: boolean;
	};

export function SidebarLink(props: SidebarLinkProps) {
	const { className, children, icon: Icon, comingSoon, state, ...rest } = props;

	return (
		<Link
			{...rest}
			className={sidebarLinkStyles().base({
				state: "inactive",
				className,
				comingSoon,
			})}
			activeProps={{
				className: sidebarLinkStyles().base({
					state: "active",
					className,
					comingSoon,
				}),
			}}
			disabled={comingSoon}
		>
			<Icon className="size-4" />
			<p className={sidebarLinkStyles().text()}>{children}</p>
			{comingSoon && (
				<span className={sidebarLinkStyles().comingSoonBadge()}>Soon</span>
			)}
		</Link>
	);
}
