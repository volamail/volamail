import { Title } from "@solidjs/meta";
import { Breadcrumbs } from "~/lib/ui/components/breadcrumbs";
import { Button } from "~/lib/ui/components/button";
import { CircleCheckBigIcon, SendIcon } from "lucide-solid";
import { Editor } from "~/lib/editor/components/editor";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { showToast } from "~/lib/ui/components/toasts";
import { createTemplate } from "~/lib/templates/actions/createTemplate";
import { sendTestMail } from "~/lib/mail/actions";
import {
	createAsync,
	type RouteDefinition,
	type RouteSectionProps,
} from "@solidjs/router";
import { Show } from "solid-js";
import { getTemplate } from "~/lib/templates/queries";

import "./editor.css";

export const route: RouteDefinition = {
	preload({ params }) {
		void getTemplate({
			projectId: params.projectId,
			slug: params.slug,
		});
	},
};

export default function EditTemplatePage(props: RouteSectionProps) {
	const template = createAsync(() =>
		getTemplate({
			projectId: props.params.projectId,
			slug: props.params.slug,
		}),
	);

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
		<main class="grow h-full flex flex-col justify-center items-stretch">
			<Title>Edit template - Volamail</Title>

			<div class="flex justify-between items-center px-4 py-3 border-b gap-8 border-gray-200 text-sm bg-white">
				<Breadcrumbs
					crumbs={[{ label: "Emails", href: ".." }, { label: "Edit email" }]}
				/>

				<div class="flex gap-2">
					<Button
						variant="outline"
						type="submit"
						icon={() => <SendIcon class="size-4" />}
						form="create-email-form"
						formAction={sendTestMail}
						loading={sendTestMailAction.pending}
					>
						Send test mail
					</Button>

					<Button
						icon={() => <CircleCheckBigIcon class="size-4" />}
						type="submit"
						form="edit-email-form"
					>
						Save changes
					</Button>
				</div>
			</div>

			<Show when={template()}>
				{(template) => (
					<form
						class="flex flex-col grow bg-grid-black/5"
						autocomplete="off"
						method="post"
						id="edit-email-form"
						action={createTemplate}
					>
						<input
							type="hidden"
							name="projectId"
							value={props.params.projectId}
						/>

						<div class="flex flex-col p-4 gap-2 bg-white border-b border-gray-200">
							<div class="flex gap-1 items-center">
								<label for="slug" class="text-sm font-medium">
									Slug:
								</label>
								<input
									type="text"
									id="slug"
									name="slug"
									required
									placeholder="welcome-email"
									class="outline-none text-sm grow"
									value={template().slug}
								/>
							</div>

							<div class="flex gap-1 items-center">
								<label for="subject" class="text-sm font-medium">
									Subject:
								</label>
								<input
									type="text"
									id="subject"
									name="subject"
									required
									placeholder="Welcome to Volamail"
									class="outline-none text-sm grow"
									value={template().subject}
								/>
							</div>
						</div>

						<Editor name="contents" defaultContents={template().contents} />
					</form>
				)}
			</Show>
		</main>
	);
}
