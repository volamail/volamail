import { SidebarLink } from "./sidebar-link";

interface SidebarSectionProps {
	title: string;
	links: Array<{
		href: string;
		label: string;
		icon: React.ComponentType<{ className?: string }>;
		comingSoon?: boolean;
	}>;
}

export function SidebarSection(props: SidebarSectionProps) {
	return (
		<section className="flex flex-col gap-3">
			<h3 className="font-medium text-gray-600 text-xs dark:text-white">
				{props.title}
			</h3>
			<ul className="flex flex-col gap-1">
				{props.links.map((link) => (
					<li key={link.href}>
						<SidebarLink
							to={link.href}
							icon={link.icon}
							comingSoon={link.comingSoon}
						>
							{link.label}
						</SidebarLink>
					</li>
				))}
			</ul>
		</section>
	);
}
