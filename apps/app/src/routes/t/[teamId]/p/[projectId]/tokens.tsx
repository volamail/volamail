// @refresh reload

import {
  type ComponentProps,
  For,
  Show,
  Suspense,
  createSignal,
  createMemo,
  splitProps,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { twMerge } from "tailwind-merge";
import { CopyIcon, EyeIcon, PlusIcon, Trash2Icon } from "lucide-solid";
import { RouteDefinition, createAsync, useParams } from "@solidjs/router";

import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { createApiToken } from "~/lib/api-tokens/actions";
import { getProjectTokens } from "~/lib/api-tokens/queries";
import { RevokeTokenDialog } from "~/lib/api-tokens/components/revoke-token-dialog";

export const route: RouteDefinition = {
  load({ params }) {
    void getProjectTokens(params.projectId);
  },
};

export default function Tokens() {
  const params = useParams();

  const tokens = createAsync(() => getProjectTokens(params.projectId));

  const [tokenIdToRevoke, setTokenIdToRevoke] = createSignal<string>();

  const createApiTokenAction = useMutation({
    action: createApiToken,
    onSuccess() {
      showToast({
        title: "Token created",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: "Unable to create token",
        variant: "error",
      });
    },
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
                  <li class="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 text-sm flex justify-between items-start">
                    <div class="flex flex-col gap-1">
                      <Token
                        class="text-sm font-semibold font-mono"
                        revoked={token.revokedAt !== null}
                      >
                        {token.token}
                      </Token>

                      <p class="text-xs text-gray-500 inline-flex gap-1 items-center">
                        <Show
                          when={token.revokedAt === null}
                          fallback={
                            <span>
                              Revoked at{" "}
                              <span class="font-medium">
                                {token.revokedAt!.toLocaleString("en-US")}
                              </span>
                            </span>
                          }
                        >
                          Created by{" "}
                          <span class="font-medium">{token.creator.name}</span>
                          at{" "}
                          <span class="font-medium">
                            {token.createdAt.toLocaleString("en-US")}
                          </span>
                        </Show>
                      </p>
                    </div>
                    <Show when={token.revokedAt === null}>
                      <Button
                        color="destructive"
                        variant="ghost"
                        even
                        class="p-1"
                        onClick={() => setTokenIdToRevoke(token.id)}
                        aria-label="Revoke token"
                        type="button"
                      >
                        <Trash2Icon class="size-4" />
                      </Button>
                    </Show>
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
              loading={createApiTokenAction.pending}
            >
              Create token
            </Button>
          </form>

          <RevokeTokenDialog
            tokenId={tokenIdToRevoke()}
            projectId={params.projectId}
            onClose={() => setTokenIdToRevoke()}
          />
        </Suspense>
      </div>
    </main>
  );
}

type TokenProps = Omit<ComponentProps<"div">, "children"> & {
  children: string;
  revoked?: boolean;
};

function Token(props: TokenProps) {
  const [local, others] = splitProps(props, ["children", "class", "revoked"]);

  const [hidden, setHidden] = createSignal(true);

  const children = createMemo(() => {
    if (hidden() && !props.revoked) {
      return props.children
        .split("")
        .map((c, i) => (i > 6 ? "*" : c))
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
    <div
      {...others}
      class={twMerge("inline-flex gap-2 items-center", local.class)}
    >
      <span classList={{ "line-through text-gray-400": local.revoked }}>
        {children()}
      </span>
      <Show when={!local.revoked}>
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
      </Show>
    </div>
  );
}
