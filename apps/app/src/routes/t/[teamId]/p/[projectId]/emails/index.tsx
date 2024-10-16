import {
	A,
	createAsync,
	type RouteDefinition,
	type RouteSectionProps,
} from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { PlusIcon } from "lucide-solid";
import { For, Show, Suspense } from "solid-js";

import { Button } from "~/lib/ui/components/button";
import { getProjectTemplates } from "~/lib/templates/queries";

export const route: RouteDefinition = {
	load({ params }) {
		void getProjectTemplates(params.projectId);
	},
};

export default function Dashboard(props: RouteSectionProps) {
	const templates = createAsync(() =>
		getProjectTemplates(props.params.projectId),
	);

	return (
		<main class="grow p-8 flex flex-col gap-1.5 max-w-2xl">
			<Title>Emails - Volamail</Title>

			<div class="flex flex-col gap-2">
				<h1 class="text-3xl font-bold">Emails</h1>

				<p class="text-gray-600 mb-6">
					The list of email templates defined for this project.
				</p>
			</div>

			<Suspense
				fallback={
					<div class="flex flex-col gap-2">
						<div class="bg-gray-100 animate-pulse rounded-md h-12 p-4">
							<div class="bg-gray-300 animate-pulse rounded-md h-4 w-48" />
						</div>
						<div class="bg-gray-100 animate-pulse rounded-md h-12 p-4">
							<div class="bg-gray-300 animate-pulse rounded-md h-4 w-32" />
						</div>
					</div>
				}
			>
				<Show
					when={templates()?.length}
					fallback={
						<div class="p-4 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg text-center">
							No emails have been created yet.
						</div>
					}
				>
					<ul class="flex flex-col gap-2">
						<For each={templates()}>
							{(template) => (
								<li>
									<A
										href={template.slug}
										class="flex flex-col gap-0.5 hover:bg-gray-200 rounded-lg px-2.5 py-2 text-sm bg-gray-100 shadow-sm transition-colors cursor-default"
									>
										<p class="font-semibold">{template.slug}</p>
										<p class="text-xs text-gray-500">
											{template.createdAt.toLocaleString("en-US")}
										</p>
									</A>
								</li>
							)}
						</For>
					</ul>
				</Show>

				<Button
					as={A}
					href="new"
					class="self-start mt-2"
					icon={() => <PlusIcon class="size-4" />}
				>
					Create email
				</Button>
			</Suspense>
		</main>
	);
}
