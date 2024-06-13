// @refresh reload
import { CopyIcon, EyeIcon, PlusIcon } from "lucide-solid";
import {
  type ComponentProps,
  For,
  Show,
  Suspense,
  createEffect,
  createSignal,
  createMemo,
  splitProps,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { twMerge } from "tailwind-merge";
import { createAsync, useParams, useSubmission } from "@solidjs/router";

import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { createApiToken } from "~/lib/api-tokens/actions";
import { getProjectTokens } from "~/lib/api-tokens/queries";

export default function Tokens() {
  const params = useParams();

  const tokens = createAsync(() => getProjectTokens(params.projectId));

  const submission = useSubmission(createApiToken);

  createEffect(() => {
    if (submission.error) {
      return showToast({
        title: "Unable to create token",
        variant: "error",
      });
    }

    if (submission.result) {
      return showToast({
        title: "Token created!",
        variant: "success",
      });
    }
  });

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>API tokens - Volamail</Title>

      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">API Tokens</h1>
        <p class="text-gray-600">
          The list of API tokens defined for this project.
        </p>

        <p class="text-gray-600">
          These are used by developers to send email templates via API.
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Suspense
          fallback={
            <div class="flex flex-col gap-2">
              <div class="bg-gray-100 animate-pulse rounded-md h-12 p-4 mb-1">
                <div class="bg-gray-300 animate-pulse rounded-md h-4 w-48" />
              </div>
              <div class="bg-gray-100 animate-pulse rounded-md h-12 p-4">
                <div class="bg-gray-300 animate-pulse rounded-md h-4 w-32" />
              </div>
            </div>
          }
        >
          <Show
            when={tokens()?.length}
            fallback={
              <div class="p-4 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg text-center">
                No tokens for this project
              </div>
            }
          >
            <ul class="flex flex-col gap-2 grow">
              <For each={tokens()}>
                {(token) => (
                  <li class="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <div class="flex flex-col gap-1">
                      <Token class="text-sm font-semibold font-mono">
                        {token.token}
                      </Token>

                      <p class="text-xs text-gray-500 inline-flex gap-1 items-center">
                        Created by{" "}
                        <span class="font-medium">{token.creator.email}</span>-{" "}
                        {token.createdAt.toLocaleString("en-US")}
                      </p>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>

          <form
            class="flex justify-start mt-2"
            action={createApiToken}
            method="post"
          >
            <input type="hidden" name="projectId" value={params.projectId} />

            <Button
              type="submit"
              class="self-start"
              icon={() => <PlusIcon class="size-4" />}
              loading={submission.pending}
            >
              Create token
            </Button>
          </form>
        </Suspense>
      </div>
    </main>
  );
}

type TokenProps = Omit<ComponentProps<"span">, "children"> & {
  children: string;
};

function Token(props: TokenProps) {
  const [local, others] = splitProps(props, ["children", "class"]);

  const [hidden, setHidden] = createSignal(true);

  const children = createMemo(() => {
    if (hidden()) {
      return props.children
        .split("")
        .map((c, i) => (i > 4 ? "*" : c))
        .join("");
    }

    return props.children;
  });

  function copyToClipboard() {
    navigator.clipboard.writeText(props.children);

    showToast({
      variant: "success",
      title: "Token copied to clipboard",
    });
  }

  return (
    <span
      {...others}
      class={twMerge("inline-flex gap-2 items-center", local.class)}
    >
      {children()}
      <button
        type="button"
        onClick={() => setHidden(!hidden())}
        class="text-gray-500 hover:text-gray-700 cursor-default"
        aria-label="Toggle token visibility"
      >
        <EyeIcon class="size-4" />
      </button>
      <button
        aria-label="Copy to clipboard"
        type="button"
        onClick={copyToClipboard}
        class="text-gray-500 hover:text-gray-700 cursor-default"
      >
        <CopyIcon class="size-4" />
      </button>
    </span>
  );
}
