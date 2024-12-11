import { ProjectSwitch } from "@/modules/organization/components/project-switch";
import {
	AtSignIcon,
	Code2Icon,
	CreditCardIcon,
	LogsIcon,
	Settings2Icon,
	SettingsIcon,
	Table2Icon,
	UserRoundCogIcon,
	Users2Icon,
} from "lucide-react";
import { SidebarSection } from "./sidebar-section";
import { SidebarUserSection } from "./sidebar-user-section";

interface SidebarProps {
	teams: Array<{
		id: string;
		name: string;
		projects: Array<{
			id: string;
			name: string;
		}>;
	}>;
	current: {
		teamId: string;
		projectId: string;
	};
}

export function Sidebar(props: SidebarProps) {
	const { current } = props;

	function getRelativeHref(path: string) {
		return `/t/${current.teamId}/p/${current.projectId}/${path}`;
	}

	return (
		<nav className="sticky top-0 h-dvh self-stretch dark:bg-gray-950 w-64 p-4 flex flex-col gap-6 border-r dark:border-gray-800">
			<ProjectSwitch teams={props.teams} current={props.current} />

			<div className="flex flex-col gap-6 grow">
				<SidebarSection
					title="Project"
					links={[
						{
							href: getRelativeHref("templates"),
							label: "Templates",
							icon: Table2Icon,
						},
						{
							href: getRelativeHref("users"),
							label: "Users",
							icon: Users2Icon,
							comingSoon: true,
						},
						{
							href: getRelativeHref("logs"),
							label: "Logs",
							icon: LogsIcon,
						},
						{
							href: getRelativeHref("domains"),
							label: "Domains",
							icon: AtSignIcon,
						},
						{
							href: getRelativeHref("api-tokens"),
							label: "API Tokens",
							icon: Code2Icon,
						},
						{
							href: getRelativeHref("settings"),
							label: "Settings",
							icon: Settings2Icon,
						},
					]}
				/>

				<SidebarSection
					title="Team"
					links={[
						{
							href: getRelativeHref("billing"),
							label: "Billing",
							icon: CreditCardIcon,
						},
						{
							href: getRelativeHref("members"),
							label: "Members",
							icon: UserRoundCogIcon,
						},
						{
							href: getRelativeHref("team-settings"),
							label: "Settings",
							icon: SettingsIcon,
						},
					]}
				/>
			</div>

			<SidebarUserSection />
		</nav>
	);
}
