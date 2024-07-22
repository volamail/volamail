import { Title } from "@solidjs/meta";
import { CircleCheckBigIcon } from "lucide-solid";
import { Button } from "~/lib/ui/components/button";
import { DeleteAccoutDialog } from "~/lib/users/components/delete-account-dialog";

export default function Profile() {
  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Profile - Volamail</Title>

      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">Profile</h1>

        <p class="text-gray-600">In this page you can manage your profile.</p>
      </div>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Settings</h2>

        <form class="flex flex-col gap-6" method="post">
          <Button
            type="submit"
            class="self-end"
            icon={() => <CircleCheckBigIcon class="size-4" />}
          >
            Save
          </Button>
        </form>
      </section>

      <hr class="w-full border-gray-200" />

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Danger zone</h2>

        <DeleteAccoutDialog />
      </section>
    </main>
  );
}
