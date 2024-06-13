import { For, Show, createMemo } from "solid-js";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-solid";
import { A, createAsync, useLocation, useParams } from "@solidjs/router";

import { buttonVariants } from "./button";
import type { DbProject } from "../../db/schema";
import { getUserProjects } from "~/lib/projects/queries";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "./popover";

export function ProjectSelector() {
  const params = useParams();

  const projects = createAsync(() => getUserProjects());

  const currentProject = createMemo(() => {
    for (const team of projects()?.teams ?? []) {
      const project = team.projects.find(
        (project) => project.id === params.projectId
      );

      if (project) {
        return project;
      }
    }
  });

  return (
    <PopoverRoot placement="bottom-start">
      <PopoverTrigger
        class={buttonVariants({
          variant: "outline",
          class: "rounded-md justify-between hover:bg-white bg-gray-50",
        })}
      >
        {currentProject()?.name}
        <ChevronsUpDownIcon class="size-4" />
      </PopoverTrigger>
      <PopoverContent class="flex flex-col w-64 overflow-y-auto max-h-64 p-0">
        <For each={projects()!.teams}>
          {(team) => (
            <>
              <ProjectsNavigation
                title={
                  team.personal
                    ? "Personal projects"
                    : `${team.name}'s projects`
                }
                projects={team.projects}
              />
              <hr class="w-full border-gray-200" />
            </>
          )}
        </For>

        <A
          href="/dashboard/create-team"
          class={buttonVariants({
            class: "m-2 justify-center rounded-md",
          })}
        >
          Create team <PlusIcon class="size-4" />
        </A>
      </PopoverContent>
    </PopoverRoot>
  );
}

type TeamsProjectsProps = {
  title: string;
  projects: DbProject[];
};

function ProjectsNavigation(props: TeamsProjectsProps) {
  const params = useParams();
  const location = useLocation();

  const currentDashboardSection = location.pathname.split("/").slice(6)[0];

  return (
    <div class="px-2 pt-4 pb-2 flex flex-col gap-1">
      <p class="text-sm text-gray-500 pl-2.5">{props.title}</p>
      <ul class="flex flex-col gap-1 w-full">
        <For each={props.projects}>
          {(project) => (
            <li class="text-sm w-full">
              <A
                href={`/dashboard/t/${project.teamId || 0}/p/${
                  project.id
                }/${currentDashboardSection}`}
                class={buttonVariants({
                  variant: "ghost",
                  class: "rounded-md justify-between px-2.5",
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
