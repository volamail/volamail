import { Avatar } from "@/modules/ui/components/avatar";
import { useImperativeDialog } from "@/modules/ui/components/dialog";
import { Tooltip } from "@/modules/ui/components/tooltip";
import { cn } from "@/modules/ui/utils/cn";
import {
	Menu,
	type MenuItemProps,
	type MenuSelectionDetails,
	Portal,
} from "@ark-ui/react";
import { Link } from "@tanstack/react-router";
import {
	CheckIcon,
	ChevronRightIcon,
	ChevronsUpDownIcon,
	PlusIcon,
	SettingsIcon,
} from "lucide-react";
import { useMemo } from "react";
import { CreateProjectDialog } from "./create-project-dialog";
import { CreateTeamDialog } from "./create-team-dialog";

interface ProjectSwitchProps {
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

export function ProjectSwitch(props: ProjectSwitchProps) {
	const currentProject = useMemo(() => {
		for (const team of props.teams) {
			for (const project of team.projects) {
				if (
					props.current.teamId === team.id &&
					props.current.projectId === project.id
				) {
					return {
						...project,
						initials: project.name
							.split(" ")
							.map((word) => word[0])
							.slice(0, 2)
							.join("")
							.toUpperCase(),
						team,
					};
				}
			}
		}

		return null;
	}, [props.current, props.teams]);

	const createTeamDialog = useImperativeDialog<undefined>();
	const createProjectDialog = useImperativeDialog<{ teamId: string }>();

	function handleTeamMenuSelect(details: MenuSelectionDetails) {
		if (details.value === "create-team") {
			return createTeamDialog.open(undefined);
		}
	}

	function handleTeamSubMenuSelect(details: MenuSelectionDetails) {
		const [teamId, action] = details.value.split(":");

		if (action === "create-project") {
			return createProjectDialog.open({ teamId });
		}
	}

	return (
		<>
			<Menu.Root onSelect={handleTeamMenuSelect}>
				<Menu.Trigger className="min-w-0 truncate w-full flex gap-2.5 justify-start items-center px-2.5 py-1.5 text-sm rounded-lg border dark:border-gray-800 dark:bg-gray-900 hover:dark:bg-gray-800 transition-colors outline-none focus-visible:ring-[1px] ring-primary-600">
					{currentProject?.name ? (
						<>
							<Avatar
								fallback={currentProject?.initials || "?"}
								className="shrink-0"
							/>
							<div className="flex flex-col text-left items-start grow min-w-0 truncate">
								<span className="text-xs dark:text-gray-400">
									{currentProject.team.name}
								</span>
								<span className="dark:text-gray-50">{currentProject.name}</span>
							</div>
						</>
					) : (
						"-"
					)}
					<ChevronsUpDownIcon className="size-4 shrink-0" />
				</Menu.Trigger>
				<Menu.Positioner>
					<Menu.Content className="w-[--reference-width] rounded-md border dark:border-gray-800 dark:bg-gray-900 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out outline-none">
						<Menu.ItemGroup className="p-1.5 flex flex-col">
							<Menu.ItemGroupLabel className="text-xs py-1.5 px-2 dark:text-gray-500">
								Teams
							</Menu.ItemGroupLabel>
							<div className="flex flex-col gap-0.5">
								{props.teams.map((team) => (
									<Menu.Root
										onSelect={handleTeamSubMenuSelect}
										key={team.id}
										positioning={{ placement: "right-start", gutter: 14 }}
									>
										<Menu.TriggerItem className="text-sm inline-flex gap-2 items-center justify-between rounded-md py-1.5 cursor-default transition-colors px-2 data-[highlighted]:dark:bg-gray-800">
											{team.name}
											<ChevronRightIcon
												className={cn(
													"size-3.5 shrink-0",
													team.id === props.current.teamId &&
														"dark:text-primary-400",
												)}
											/>
										</Menu.TriggerItem>
										<Portal>
											<Menu.Positioner>
												<Menu.Content className="shadow w-[--reference-width] rounded-md border dark:border-gray-800 dark:bg-gray-900 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out outline-none">
													<Menu.ItemGroup className="p-1.5 flex flex-col">
														<Menu.ItemGroupLabel className="text-xs py-1.5 px-2 dark:text-gray-500">
															{team.name}
														</Menu.ItemGroupLabel>
														<div className="flex flex-col gap-0.5">
															{team.projects.map((project) => (
																<MenuItem
																	key={project.id}
																	value={`${team.id}:${project.id}`}
																	asChild
																>
																	<Link
																		to="/t/$teamId/p/$projectId/templates"
																		params={{
																			teamId: team.id,
																			projectId: project.id,
																		}}
																	>
																		{project.name}
																		{props.current.teamId === team.id &&
																			props.current.projectId ===
																				project.id && (
																				<CheckIcon className="size-3.5 shrink-0 dark:text-primary-400" />
																			)}
																	</Link>
																</MenuItem>
															))}
														</div>
													</Menu.ItemGroup>
													<Menu.Separator className="dark:border-gray-800" />
													<Menu.ItemGroup className="p-1.5 flex flex-col">
														{team.projects.length < 3 ? (
															<MenuItem value={`${team.id}:create-project`}>
																Create project
																<PlusIcon className="size-3.5 shrink-0" />
															</MenuItem>
														) : (
															<Tooltip
																content="Maximum number of projects reached"
																placement="right"
															>
																<MenuItem
																	value={`${team.id}:create-project`}
																	disabled
																>
																	Create project
																	<PlusIcon className="size-3.5 shrink-0" />
																</MenuItem>
															</Tooltip>
														)}
														<MenuItem value={`${team.id}:manage-team`} asChild>
															<Link
																to="/t/$teamId/p/$projectId/team-settings"
																params={{
																	teamId: team.id,
																	projectId: team.projects[0].id,
																}}
															>
																Manage team
																<SettingsIcon className="size-3.5 shrink-0" />
															</Link>
														</MenuItem>
													</Menu.ItemGroup>
												</Menu.Content>
											</Menu.Positioner>
										</Portal>
									</Menu.Root>
								))}
							</div>
						</Menu.ItemGroup>

						<Menu.Separator className="dark:border-gray-800" />
						<Menu.ItemGroup className="p-1.5 flex flex-col">
							{props.teams.length < 3 ? (
								<MenuItem value="create-team">
									Create team
									<PlusIcon className="size-3.5 shrink-0" />
								</MenuItem>
							) : (
								<Tooltip
									content="Maximum number of teams reached"
									placement="right"
								>
									<MenuItem value="create-team" disabled>
										Create team
										<PlusIcon className="size-3.5 shrink-0" />
									</MenuItem>
								</Tooltip>
							)}
						</Menu.ItemGroup>
					</Menu.Content>
				</Menu.Positioner>
			</Menu.Root>

			<CreateTeamDialog {...createTeamDialog.props} />
			<CreateProjectDialog {...createProjectDialog.props} />
		</>
	);
}

function MenuItem({ className, ...props }: MenuItemProps) {
	return (
		<Menu.Item
			{...props}
			className={cn(
				"text-sm inline-flex aria-[disabled=true]:opacity-50 aria-[disabled=true]:dark:hover:bg-gray-800 gap-2 dark:text-gray-50 items-center justify-between rounded-md py-1.5 cursor-default transition-colors px-2 data-[highlighted]:dark:bg-gray-800",
				className,
			)}
		/>
	);
}
