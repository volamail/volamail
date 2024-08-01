import { A, createAsync, useLocation, useParams } from "@solidjs/router";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-solid";
import { For, Show, createMemo } from "solid-js";

import { getUserTeams } from "~/lib/teams/loaders";
import { cn } from "~/lib/ui/utils/cn";
import type { DbProject } from "../../db/schema";
import { Button, buttonVariants } from "../../ui/components/button";
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "../../ui/components/popover";
import { CreateProjectDialog } from "./create-project-dialog";
import { MAX_TEAMS_PER_USER } from "~/lib/subscriptions/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/lib/ui/components/tooltip";

export function ProjectSelector() {
  const params = useParams();

  const teams = createAsync(() => getUserTeams());

  const currentProject = createMemo(() => {
    for (const project of [
      ...(teams()?.personal?.projects || []),
      ...(teams()?.other || []).flatMap((team) => team.projects),
    ]) {
      if (project.id === params.projectId) {
        return project;
      }
    }
  });

  const reachedMaxTeams = createMemo(() => {
    const nonPersonalTeams = teams()?.other;

    if (!nonPersonalTeams) {
      return false;
    }

    return nonPersonalTeams.length >= MAX_TEAMS_PER_USER;
  });

  return (
    <PopoverRoot placement="bottom-start">
      <PopoverTrigger
        class={buttonVariants({
          variant: "outline",
          class: "grow rounded-md justify-between hover:bg-white bg-gray-50",
        })}
      >
        {currentProject()?.name}
        <ChevronsUpDownIcon class="size-4" />
      </PopoverTrigger>
      <PopoverContent
        class="flex flex-col w-64 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();

          const target = e.target as HTMLDivElement;

          const firstLink = target.querySelector("a");

          firstLink?.focus();
        }}
      >
        <div class="max-h-96 verflow-y-auto">
          <ProjectsNavigation
            title="Personal projects"
            team={teams()!.personal!}
          />
          <For each={teams()!.other}>
            {(team) => (
              <ProjectsNavigation
                title={`${team.name}'s projects`}
                team={team}
              />
            )}
          </For>
        </div>

        <div class="p-2 border-t border-gray-300">
          <Tooltip disabled={!reachedMaxTeams()}>
            <TooltipTrigger
              as={reachedMaxTeams() ? Button : A}
              href="/create-team"
              class={buttonVariants({
                variant: "outline",
                class: "justify-center rounded-md w-full",
              })}
              // @ts-expect-error too polymorphic
              disabled={reachedMaxTeams() ? true : undefined}
            >
              Create team <PlusIcon class="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              You've reached the maximum number of teams you can be part of.
              Please contact us if you need more.
            </TooltipContent>
          </Tooltip>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}

type TeamsProjectsProps = {
  title: string;
  team: {
    id: string;
    projects: DbProject[];
    reachedProjectLimit: boolean;
  };
};

function ProjectsNavigation(props: TeamsProjectsProps) {
  const params = useParams();
  const location = useLocation();

  const currentDashboardSection = location.pathname.split("/").slice(5)[0];

  return (
    <div class="px-2 pt-4 pb-2 flex flex-col gap-1 border-b border-gray-300 last:border-b-0">
      <div class="text-sm text-gray-500 pr-1.5 pl-2.5 inline-flex items-center justify-start gap-1.5">
        <p class="grow">{props.title}</p>
        <CreateProjectDialog
          team={{
            id: props.team.id,
            name: props.title,
          }}
          disabledReason={
            props.team.reachedProjectLimit
              ? "Project limit reached for this team. Upgrade your plan to create more projects."
              : undefined
          }
        />
      </div>
      <ul class="flex flex-col gap-0.5 w-full">
        <For each={props.team.projects}>
          {(project) => (
            <li class="text-sm w-full">
              <A
                href={`/t/${project.teamId}/p/${project.id}/${currentDashboardSection}`}
                class={buttonVariants({
                  variant: "ghost",
                  class: cn(
                    "rounded-md justify-between px-2.5",
                    project.id === params.projectId && "bg-gray-100"
                  ),
                })}
              >
                {project.name}
                <Show when={project.id === params.projectId}>
                  <CheckIcon class="size-4" />
                </Show>
              </A>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
