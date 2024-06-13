import { GithubIcon } from "lucide-solid";
import { useIsRouting, useSubmission } from "@solidjs/router";

import { Button } from "~/lib/ui/components/button";
import { loginWithGithub } from "~/lib/auth/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { Title } from "@solidjs/meta";

export default function Login() {
  const isRouting = useIsRouting();
  const loginAction = useSubmission(loginWithGithub);

  return (
    <GridBgContainer>
      <Title>Login - Voramail</Title>
      <form
        action={loginWithGithub}
        method="post"
        class="shadow-xl border rounded-lg bg-white max-w-sm w-full p-8 flex flex-col gap-1"
      >
        <h1 class="text-2xl font-semibold">Login</h1>
        <p class="text-gray-600 text-sm">
          Sign in to your account to start collaborating on your emails.
        </p>

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
