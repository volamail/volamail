import { Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { GithubIcon, SendIcon } from "lucide-solid";
import { useIsRouting, useSearchParams } from "@solidjs/router";

import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { loginWithGithub, sendEmailOtp } from "~/lib/auth/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export default function Login() {
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
      console.log(e);
      showToast({
        title: "Unable to send OTP",
        variant: "error",
      });
    },
  });

  const [searchParams] = useSearchParams();

  return (
    <GridBgContainer>
      <Title>Login - Volamail</Title>

      <form
        action={sendEmailOtp}
        method="post"
        class="shadow-xl border rounded-xl bg-white max-w-sm w-full p-8 flex flex-col gap-1"
      >
        <h1 class="text-2xl font-semibold">Login</h1>
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
            loading={loginWithGithubAction.pending}
            icon={() => <GithubIcon class="size-4" />}
          >
            Sign in with GitHub
          </Button>
        </div>
      </form>
    </GridBgContainer>
  );
}
