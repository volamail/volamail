// @refresh reload
import "./editor.css";

import { Title } from "@solidjs/meta";
import { createSignal, Show } from "solid-js";
import {
  BeforeLeaveEventArgs,
  useBeforeLeave,
  type RouteSectionProps,
} from "@solidjs/router";
import { CircleCheckBigIcon, SendIcon } from "lucide-solid";

import { Input } from "~/lib/ui/components/input";
import { sendTestMail } from "~/lib/mail/actions";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { Textarea } from "~/lib/ui/components/textarea";
import { Editor } from "~/lib/editor/components/editor";
import { createTemplate } from "~/lib/templates/actions";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { Breadcrumbs } from "~/lib/ui/components/breadcrumbs";
import { EditorStartingScreen } from "~/lib/editor/components/starting-screen";

export default function NewTemplate(props: RouteSectionProps) {
  const [html, setHtml] = createSignal("");

  const createEmailAction = useMutation({
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
    onError() {
      showToast({
        title: "Unable to send test email",
        variant: "error",
      });
    },
  });

  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    if (html() && !createEmailAction.pending && !sendTestMailAction.pending) {
      e.preventDefault();

      if (
        window.confirm(
          "You didn't save your email - are you sure you want to leave?"
        )
      ) {
        e.retry(true);
      }
    }
  });

  return (
    <main class="h-dvh flex flex-col bg-gray-100 min-h-0">
      <Title>New email - Volamail</Title>

      <div class="flex justify-between items-center px-4 py-3 border-b gap-8 border-gray-200 text-sm bg-white">
        <Breadcrumbs
          crumbs={[{ label: "Emails", href: ".." }, { label: "New email" }]}
        />

        <Show when={html()}>
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
              form="create-email-form"
              loading={createEmailAction.pending}
            >
              Create email
            </Button>
          </div>
        </Show>
      </div>

      <div class="flex grow min-h-0 overflow-hidden">
        <Show when={html()}>
          <form
            method="post"
            id="create-email-form"
            autocomplete="off"
            action={createTemplate}
            class="bg-white border-r p-4 w-72 gap-4 flex flex-col shrink-0"
          >
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
              />
            </div>
            <div class="flex flex-col gap-1">
              <label for="subject" class="font-medium text-sm">
                Subject
              </label>
              <Input
                type="text"
                placeholder="Welcome to our service..."
                name="subject"
                id="subject"
                required
              />
            </div>

            <input type="hidden" name="body" value={html()} />
          </form>
        </Show>

        <Show
          when={html()}
          fallback={
            <EditorStartingScreen
              projectId={props.params.projectId}
              onDone={setHtml}
            />
          }
        >
          <Editor
            value={html()}
            onChange={setHtml}
            projectId={props.params.projectId}
          />
        </Show>
      </div>
    </main>
  );
}
