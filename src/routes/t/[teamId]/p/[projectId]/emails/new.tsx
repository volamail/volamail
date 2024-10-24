import "./editor.css";

import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
} from "@solidjs/router";
import { CircleCheckBigIcon, SendIcon } from "lucide-solid";
import slugify from "slugify";
import { Suspense } from "solid-js";
import { Show, createSignal } from "solid-js";
import * as v from "valibot";
import { Editor, EditorSkeleton } from "~/lib/editor/components/editor";
import { sendTestMail } from "~/lib/mail/actions";
import { getProject } from "~/lib/projects/queries";
import { createTemplate } from "~/lib/templates/actions";
import { Breadcrumbs } from "~/lib/ui/components/breadcrumbs";
import { Button } from "~/lib/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "~/lib/ui/components/dialog";
import { Input } from "~/lib/ui/components/input";
import { showToast } from "~/lib/ui/components/toasts";
import { createForm } from "~/lib/ui/hooks/createForm";
import { useMutation } from "~/lib/ui/hooks/useMutation";

export const route: RouteDefinition = {
	preload({ params }) {
		void getProject({
			teamId: params.teamId,
			projectId: params.projectId,
		});
	},
};

export default function NewTemplate(props: RouteSectionProps) {
	const [dialogOpen, setDialogOpen] = createSignal(false);

	const project = createAsync(() =>
		getProject({
			teamId: props.params.teamId,
			projectId: props.params.projectId,
		}),
	);

	const createTemplateAction = useMutation({
		action: createTemplate,
		onSuccess() {
			showToast({
				title: "Email created!",
				variant: "success",
			});
		},
		onError() {
			showToast({
				title: "Unable to create email",
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

	const form = createForm({
		schema: v.object({
			"template.slug": v.pipe(
				v.string(),
				v.minLength(2, "Must be at least 2 characters"),
				v.maxLength(64, "Must be less than 64 characters"),
				v.custom(
					(slug) =>
						slugify(slug as string, { lower: true, strict: true }) === slug,
					"Must be lowercase with dashes (e.g. my-welcome-email)",
				),
			),
		}),
		defaultValues: {},
	});

	return (
		<form
			class="flex flex-col h-dvh"
			autocomplete="off"
			method="post"
			action={createTemplate}
			id="create-template-form"
			onSubmit={async (event) => {
				if (dialogOpen()) {
					await form.handleSubmit(event);

					return;
				}

				event.preventDefault();

				setDialogOpen(true);
			}}
		>
			<Title>New email - Volamail</Title>

			<div class="flex justify-between items-center px-4 py-3 shrink-0 border-b gap-8 border-gray-200 text-sm bg-white">
				<Breadcrumbs
					crumbs={[{ label: "Emails", href: ".." }, { label: "New email" }]}
				/>

				<div class="flex gap-2">
					<input
						type="hidden"
						name="projectId"
						value={props.params.projectId}
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
					>
						Create email
					</Button>

					<Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
						<DialogContent class="flex flex-col gap-4">
							<div class="flex flex-col gap-2">
								<DialogTitle>Create email template</DialogTitle>
								<DialogDescription>
									Choose a name for this email.
								</DialogDescription>
							</div>

							<Input
								{...form.getFieldProps("template.slug")}
								required
								label="Name"
								hint="Should be lowercase with dashes (e.g. my-welcome-email)"
								form="create-template-form"
							/>

							<Button
								type="submit"
								icon={() => <CircleCheckBigIcon class="size-4" />}
								class="self-end"
								form="create-template-form"
								loading={createTemplateAction.pending}
							>
								Save email
							</Button>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Suspense fallback={<EditorSkeleton />}>
				<Show when={project()}>
					{(project) => <Editor project={project()} />}
				</Show>
			</Suspense>
		</form>
	);
}
