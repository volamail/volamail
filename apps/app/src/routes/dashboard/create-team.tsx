// @refresh reload
import { createEffect } from "solid-js";
import { PlusIcon } from "lucide-solid";
import { useSubmission } from "@solidjs/router";

import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { createTeam } from "~/lib/teams/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { Title } from "@solidjs/meta";

export default function CreateTeam() {
  const submission = useSubmission(createTeam);

  createEffect(() => {
    if (submission.error) {
      showToast({
        title: "Unable to create team",
        variant: "error",
      });
    } else if (submission.result) {
      showToast({
        title: "Team created! You're being redirected...",
        variant: "success",
      });
    }
  });

  return (
    <GridBgContainer>
      <Title>Create team - Voramail</Title>
      <form
        method="post"
        action={createTeam}
        class="p-8 rounded-xl bg-white shadow flex flex-col gap-8 max-w-sm w-full border"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-medium">Create team</h1>
          <p class="text-gray-500 text-sm">
            You'll be able to invite people to your team and manage emails
            together.
          </p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="name" class="font-medium text-sm">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Company name"
            class="rounded-lg border py-1.5 px-2 text-sm"
          />
        </div>

        <Button
          type="submit"
          class="self-end"
          loading={submission.pending}
          icon={() => <PlusIcon class="size-4" />}
        >
          Create team
        </Button>
      </form>
    </GridBgContainer>
  );
}
