import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { createEffect, createSignal } from "solid-js";
import { CircleCheckBigIcon, SendIcon, Trash2Icon } from "lucide-solid";

import { Input } from "~/lib/ui/components/input";
import { sendTestMail } from "~/lib/mail/actions";
import { Button } from "~/lib/ui/components/button";
import { getTemplate } from "~/lib/templates/queries";
import { editTemplate } from "~/lib/templates/actions";
import { showToast } from "~/lib/ui/components/toasts";
import { Textarea } from "~/lib/ui/components/textarea";
import { Editor } from "~/lib/editor/components/editor";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { Breadcrumbs } from "~/lib/ui/components/breadcrumbs";
import { DeleteTemplateDialog } from "~/lib/templates/components/DeleteTemplateDialog";

export const route: RouteDefinition = {
  load({ params }) {
    void getTemplate(params.id);
  },
};

export default function EditTemplate(props: RouteSectionProps) {
  const template = createAsync(() => getTemplate(props.params.id), {
    deferStream: true,
  });

  const [html, setHtml] = createSignal(template()?.body);

  createEffect(() => {
    if (template()?.body && !html()) {
      setHtml(template()?.body);
    }
  });

  const saveAction = useMutation({
    action: editTemplate,
    onSuccess() {
      showToast({
        title: "Changes saved!",
        variant: "success",
      });
    },
    onError() {
      showToast({
        title: "Unable to save changes",
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
    onError() {
      showToast({
        title: "Unable to send test email",
        variant: "error",
      });
    },
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);

  return (
    <main class="h-dvh flex flex-col grow bg-gray-100">
      <Title>Edit email - Volamail</Title>

      <div class="flex justify-between items-center px-4 py-3 border-b gap-8 border-gray-200 text-sm bg-white">
        <Breadcrumbs
          crumbs={[{ label: "Emails", href: ".." }, { label: "Edit email" }]}
        />

        <div class="flex gap-2">
          <Button
            variant="outline"
            type="submit"
            icon={() => <SendIcon class="size-4" />}
            form="edit-email-form"
            formAction={sendTestMail}
            loading={sendTestMailAction.pending}
          >
            Send test mail
          </Button>

          <Button
            icon={() => <CircleCheckBigIcon class="size-4" />}
            type="submit"
            form="edit-email-form"
            loading={saveAction.pending}
          >
            Save changes
          </Button>
        </div>
      </div>

      <div class="flex h-full min-h-0">
        <form
          method="post"
          id="edit-email-form"
          action={editTemplate}
          class="bg-white h-full border-r p-4 w-72 gap-4 flex flex-col shrink-0"
        >
          <div class="flex flex-col grow gap-4">
            <input
              type="hidden"
              name="projectId"
              value={props.params.projectId}
            />
            <input type="hidden" name="id" value={props.params.id} />

            <div class="flex flex-col gap-1">
              <label for="slug" class="font-medium text-sm">
                Slug
              </label>
              <Input
                type="text"
                placeholder="welcome-email"
                name="slug"
                id="slug"
                required
                value={template()?.slug}
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="subject" class="font-medium text-sm">
                Subject
              </label>
              <Textarea
                placeholder="Welcome to our service..."
                name="subject"
                id="subject"
                resizeable
                required
                value={template()?.subject}
              />
            </div>

            <input type="hidden" name="body" value={html()} />
          </div>

          <Button
            type="button"
            color="destructive"
            variant="ghost"
            class="self-end"
            aria-label="Delete email"
            onClick={() => setDeleteDialogOpen(true)}
            even
            icon={() => <Trash2Icon class="size-4" />}
          />
        </form>

        <Editor
          value={html()}
          onChange={setHtml}
          projectId={props.params.projectId}
        />
      </div>

      <DeleteTemplateDialog
        projectId={props.params.projectId}
        templateId={props.params.id}
        open={deleteDialogOpen()}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </main>
  );
}
