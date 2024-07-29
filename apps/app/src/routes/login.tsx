import { Title } from "@solidjs/meta";
import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { AlertCircleIcon, GithubIcon, SendIcon } from "lucide-solid";
import { createAsync, Navigate, useSearchParams } from "@solidjs/router";

import { getAuthState } from "~/lib/auth/queries";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { loginWithGithub, sendEmailOtp } from "~/lib/auth/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

const showGithubLogin = !!(
  process.env.VITE_GITHUB_CLIENT_ID || import.meta.env.VITE_GITHUB_CLIENT_ID
);

export default function Login() {
  const [searchParams] = useSearchParams();

  const authState = createAsync(() => getAuthState());

  const loginWithGithubAction = useMutation({
    action: loginWithGithub,
  });

  const mailOtpAction = useMutation({
    action: sendEmailOtp,
    onSuccess() {
      showToast({
        title: "OTP sent!",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: e.statusMessage || "Unable to send OTP",
        variant: "error",
      });
    },
  });

  const [navigating, setNavigating] = createSignal(false);

  console.log({ env: import.meta.env });
  console.log({ showGithubLogin });

  onMount(() => {
    function handleUnload() {
      setNavigating(true);
    }

    window.addEventListener("beforeunload", handleUnload);

    onCleanup(() => {
      window.removeEventListener("beforeunload", handleUnload);
    });
  });

  if (authState()?.authenticated) {
    return <Navigate href="/teams" />;
  }

  return (
    <GridBgContainer class="h-dvh">
      <Title>Login - Volamail</Title>

      <form
        action={sendEmailOtp}
        method="post"
        class="shadow-xl border rounded-xl bg-white max-w-sm w-full p-8 flex flex-col gap-1"
      >
        <h1 class="text-xl font-semibold">Login</h1>
        <p class="text-gray-600 text-sm">
          Sign in to your account to start working on your team's emails.
        </p>

        <Show when={searchParams.to}>
          <input type="hidden" name="to" value={searchParams.to} />
        </Show>

        <div class="flex flex-col gap-2 mt-6">
          <div class="flex flex-col gap-2">
            <Input
              type="email"
              name="email"
              placeholder="john.doe@example.com"
              value={searchParams.email || ""}
            />

            <Button
              type="submit"
              class="justify-center py-2"
              loading={mailOtpAction.pending}
              icon={() => <SendIcon class="size-4" />}
            >
              Sign in with email
            </Button>
          </div>

          <Show when={showGithubLogin}>
            <div class="flex gap-3 items-center">
              <hr class="w-full border-gray-200" />
              <span class="text-sm text-gray-500">or</span>
              <hr class="w-full border-gray-200" />
            </div>

            <Button
              type="submit"
              class="justify-center py-2"
              variant="outline"
              formAction={loginWithGithub}
              loading={loginWithGithubAction.pending || navigating()}
              icon={() => <GithubIcon class="size-4" />}
            >
              Sign in with GitHub
            </Button>
          </Show>
        </div>

        <Show when={searchParams.error}>
          <div class="text-red-500 mt-4 bg-red-100 rounded-lg border-red-500 p-3 text-sm inline-flex gap-2 items-start">
            <AlertCircleIcon class="size-5 shrink-0" />
            <p>{searchParams.error}</p>
          </div>
        </Show>
      </form>
    </GridBgContainer>
  );
}
