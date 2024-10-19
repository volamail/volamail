import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
} from "@solidjs/router";
import { CircleCheckBigIcon, SendIcon } from "lucide-solid";
import { sendTestMail } from "~/lib/mail/actions";
import { getTemplate } from "~/lib/templates/queries";
import { Breadcrumbs } from "~/lib/ui/components/breadcrumbs";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

import "../editor.css";
import { Show } from "solid-js";
import { Editor } from "~/lib/editor/components/editor";
import { getProject } from "~/lib/projects/queries";
import { upsertTemplateTranslation } from "~/lib/templates/actions";
import type { TemplateLanguage } from "~/lib/templates/languages";
import { createForm } from "~/lib/ui/hooks/createForm";

export const route: RouteDefinition = {
	preload({ params }) {
		void getProject({
			teamId: params.teamId,
			projectId: params.projectId,
		});

		void getTemplate({
			projectId: params.projectId,
			slug: params.slug,
		});
	},
};

export default function EditTemplatePage(props: RouteSectionProps) {
	const project = createAsync(() =>
		getProject({
			teamId: props.params.teamId,
			projectId: props.params.projectId,
		}),
	);

	const template = createAsync(() =>
		getTemplate({
			projectId: props.params.projectId,
			slug: props.params.slug,
			language: props.params.language as TemplateLanguage | undefined,
		}),
	);

	const editTemplateAction = useMutation({
		action: upsertTemplateTranslation,
		onSuccess() {
			showToast({
				title: "Changes saved",
				variant: "success",
			});
		},
		onError(e) {
			showToast({
				title: e.statusMessage || "Unable to save changes",
				variant: "error",
			});
		},
	});

	const sendTestMailAction = useMutation({
		action: sendTestMail,
		onSuccess() {
			showToast({
				title: "Test email sent!",
				variant: "success",
			});
		},
		onError(e) {
			showToast({
				title: e.statusMessage || "Unable to send test email",
				variant: "error",
			});
		},
	});

	return (
		<form
			class="flex flex-col h-dvh bg-white"
			autocomplete="off"
			method="post"
			action={upsertTemplateTranslation}
		>
			<Title>Edit {props.params.slug} - Volamail</Title>

			<div class="flex justify-between items-center px-4 py-3 shrink-0 border-b gap-8 border-gray-200 text-sm bg-white">
				<Breadcrumbs
					crumbs={[
						{ label: "Emails", href: ".." },
						{ label: `Edit email - ${props.params.slug}` },
					]}
				/>

				<div class="flex gap-2">
					<input
						type="hidden"
						name="projectId"
						value={props.params.projectId}
					/>

					<input type="hidden" name="slug" value={props.params.slug} />

					<input
						type="hidden"
						name="language"
						value={props.params.language || project()?.defaultTemplateLanguage}
					/>

					<Button
						variant="outline"
						type="submit"
						icon={() => <SendIcon class="size-4" />}
						formAction={sendTestMail}
						loading={sendTestMailAction.pending}
					>
						Send test mail
					</Button>

					<Button
						icon={() => <CircleCheckBigIcon class="size-4" />}
						type="submit"
						loading={editTemplateAction.pending}
					>
						Save changes
					</Button>
				</div>
			</div>

			<Show when={project() && template()} fallback={<span>loading...</span>}>
				<Editor project={project()!} template={template()!} />
			</Show>
		</form>
	);
}
