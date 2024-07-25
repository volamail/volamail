import { Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { RotateCcw } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { changeEmail } from "~/lib/auth/actions";
import { getCurrentUser } from "~/lib/auth/queries";
import { Button } from "~/lib/ui/components/button";
import { Input } from "~/lib/ui/components/input";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { DeleteAccoutDialog } from "~/lib/users/components/delete-account-dialog";
import { VerifyEmailChangeOtpDialog } from "~/lib/users/components/verify-email-change-otp-dialog";

export default function Profile() {
  const user = createAsync(() => getCurrentUser());

  const [chosenEmail, setChosenEmail] = createSignal<string>();

  const changeEmailAction = useMutation({
    action: changeEmail,
    onSuccess(result) {
      setChosenEmail(result.data.email);
    },
    onError(e) {
      showToast({
        title: e.statusMessage || "Unable to change email",
        variant: "error",
      });
    },
  });

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Profile - Volamail</Title>

      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">Profile</h1>

        <p class="text-gray-600">In this page you can manage your profile.</p>
      </div>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Security</h2>

        <form class="flex flex-col gap-4" method="post" action={changeEmail}>
          <div class="flex flex-col gap-1 grow">
            <label for="email" class="font-medium text-sm">
              Email
            </label>
            <Input
              type="email"
              name="email"
              id="email"
              value={user()?.email}
              class="w-64"
            />
          </div>
          <Button
            type="submit"
            class="self-end"
            icon={() => <RotateCcw class="size-4" />}
            loading={changeEmailAction.pending}
          >
            Change email
          </Button>
        </form>

        <Show when={chosenEmail()}>
          {(email) => (
            <VerifyEmailChangeOtpDialog
              email={email()}
              open
              onOpenChange={() => setChosenEmail()}
            />
          )}
        </Show>
      </section>

      <hr class="w-full border-gray-200" />

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Danger zone</h2>

        <DeleteAccoutDialog />
      </section>
    </main>
  );
}
