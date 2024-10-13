import { Title } from "@solidjs/meta";
import { Show, Suspense } from "solid-js";
import { type RouteSectionProps, createAsync } from "@solidjs/router";

import { getProject } from "~/lib/projects/queries";
import { SettingsForm } from "~/lib/projects/components/settings-form";
import { AIContextForm } from "~/lib/projects/components/ai-context-form";
import { DeleteProjectDialog } from "~/lib/projects/components/delete-project-dialog";

export default function ProjectSettings(props: RouteSectionProps) {
	const project = createAsync(() =>
		getProject({
			teamId: props.params.teamId,
			projectId: props.params.projectId,
		}),
	);

	return (
		<main class="p-8 flex flex-col grow gap-8 max-w-2xl">
			<Title>Project settings - Volamail</Title>

			<h1 class="text-3xl font-bold">Project settings</h1>

			<Suspense
				fallback={
					<div class="flex flex-col gap-12 animate-pulse">
						<div class="flex gap-4">
							<div class="flex flex-col gap-2">
								<div class="w-32 h-4 rounded bg-gray-300" />
								<div class="w-48 h-8 rounded-lg bg-gray-200" />
							</div>
							<div class="flex flex-col gap-2 grow">
								<div class="w-32 h-4 rounded bg-gray-300" />
								<div class="w-full h-8 rounded-lg bg-gray-200" />
							</div>
						</div>
						<div class="w-24 h-8 rounded-lg bg-gray-400 self-end" />
					</div>
				}
			>
				<Show when={project()}>
					{(project) => <SettingsForm project={project()} />}
				</Show>
			</Suspense>

			<hr class="w-full border-gray-200" />

			<Suspense
				fallback={
					<div class="flex flex-col gap-8 animate-pulse">
						<div class="flex flex-col gap-2">
							<div class="w-32 h-4 rounded bg-gray-300" />
							<div class="w-full h-24 rounded-lg bg-gray-200" />
						</div>
						<div class="w-24 h-8 rounded-lg bg-gray-400 self-end" />
					</div>
				}
			>
				<Show when={project()}>
					{(project) => <AIContextForm project={project()} />}
				</Show>
			</Suspense>

			<hr class="w-full border-gray-200" />

			<section class="flex flex-col gap-4">
				<h2 class="text-xl font-semibold">Danger zone</h2>

				<DeleteProjectDialog projectId={props.params.projectId} />
			</section>
		</main>
	);
}
