import "./editor.css";

import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from "@solidjs/router";
import * as v from "valibot";
import { Title } from "@solidjs/meta";
import { CircleCheckBigIcon, SendIcon } from "lucide-solid";
import { createEffect, createSignal, Show, Suspense } from "solid-js";

import { Input } from "~/lib/ui/components/input";
import { sendTestMail } from "~/lib/mail/actions";
import { getProject } from "~/lib/projects/queries";
import { Button } from "~/lib/ui/components/button";
import { getTemplate } from "~/lib/templates/queries";
import { editTemplate } from "~/lib/templates/actions";
import { showToast } from "~/lib/ui/components/toasts";
import { createForm } from "~/lib/ui/hooks/createForm";
import { Editor } from "~/lib/editor/components/editor";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { Breadcrumbs } from "~/lib/ui/components/breadcrumbs";
import { EditorSkeleton } from "~/lib/editor/components/editor-skeleton";

export const route: RouteDefinition = {
  load({ params }) {
    void getTemplate(params.id);
    void getProject({
      teamId: params.teamId,
      projectId: params.projectId,
    });
  },
};

export default function EditTemplate(props: RouteSectionProps) {
  const template = createAsync(() => getTemplate(props.params.id));
  const project = createAsync(() =>
    getProject({
      teamId: props.params.teamId,
      projectId: props.params.projectId,
    })
  );

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

      <Suspense fallback={<EditorSkeleton />}>
        <Show when={template() && project()}>
          <div class="flex h-full min-h-0">
            <Sidebar
              projectId={props.params.projectId}
              template={template()!}
              html={html()!}
            />
            <Editor
              value={html()}
              onChange={setHtml}
              project={project()!}
              templateId={props.params.id}
            />
          </div>
        </Show>
      </Suspense>
    </main>
  );
}

type SidebarProps = {
  projectId: string;
  template: {
    id: string;
    slug: string;
    subject: string;
  };
  html: string;
};

function Sidebar(props: SidebarProps) {
  const form = createForm<{
    slug: string;
    subject: string;
  }>({
    defaultValues: {
      slug: props.template.slug,
      subject: props.template.subject,
    },
    schema: v.object({
      slug: v.pipe(
        v.string(),
        v.minLength(2, "Slug is too short"),
        v.maxLength(32, "Slug is too long"),
        v.regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Slug can only contain lowercase letters, numbers and hyphens"
        )
      ),
      subject: v.string(),
    }),
  });

  return (
    <form
      onSubmit={form.handleSubmit}
      method="post"
      id="edit-email-form"
      action={editTemplate}
      class="bg-white h-full border-r p-4 w-72 gap-4 flex flex-col shrink-0"
    >
      <div class="flex flex-col grow gap-4">
        <input type="hidden" name="projectId" value={props.projectId} />
        <input type="hidden" name="id" value={props.template.id} />

        <Input
          {...form.getFieldProps("slug")}
          label="Slug"
          type="text"
          placeholder="welcome-email"
          required
        />

        <Input
          {...form.getFieldProps("subject")}
          label="Subject"
          placeholder="Welcome to our service..."
          resizeable
          required
        />

        <input type="hidden" name="body" value={props.html} />
      </div>
    </form>
  );
}
