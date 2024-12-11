import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { type VariantProps, tv } from "tailwind-variants";

const sidebarLinkStyles = tv({
	base: "w-full inline-flex items-center gap-2 py-1.5 px-2.5 rounded-md text-sm  transition-colors",
	variants: {
		state: {
			inactive: "dark:text-gray-500 dark:hover:bg-gray-900",
			active:
				"bg-gray-100 ring-[1px] dark:ring-gray-800 dark:text-white dark:bg-gray-900",
		},
		comingSoon: {
			false: "",
			true: "cursor-not-allowed dark:text-gray-500",
		},
	},
	slots: {
		text: "grow",
		comingSoonBadge:
			"bg-yellow-50 inline-flex items-center gap-1 dark:bg-yellow-900 dark:text-yellow-400 text-yellow-500 text-xs rounded-full px-1.5",
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
