import { Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { GithubIcon } from "lucide-solid";
import { useIsRouting, useSearchParams, useSubmission } from "@solidjs/router";

import { Button } from "~/lib/ui/components/button";
import { loginWithGithub } from "~/lib/auth/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export default function Login() {
  const isRouting = useIsRouting();
  const loginAction = useSubmission(loginWithGithub);

  const [searchParams] = useSearchParams();

  return (
    <GridBgContainer>
      <Title>Login - Volamail</Title>

      <form
        action={loginWithGithub}
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

        <Button
          type="submit"
          class="justify-center py-2.5 mt-8"
          loading={loginAction.pending || isRouting()}
          icon={() => <GithubIcon class="size-4" />}
        >
          Sign in with GitHub
        </Button>
      </form>
    </GridBgContainer>
  );
}
