import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { createTeam } from "~/lib/teams/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { Title } from "@solidjs/meta";
import { useMutation } from "~/lib/ui/hooks/useMutation";

export default function CreateTeam() {
  const submission = useMutation({
    action: createTeam,
    onSuccess() {
      showToast({
        title: "Team created! You're being redirected...",
        variant: "success",
      });
    },
    onError() {
      showToast({
        title: "Unable to create team",
        variant: "error",
      });
    },
  });

  return (
    <GridBgContainer class="h-dvh">
      <Title>Create team - Volamail</Title>
      <form
        method="post"
        action={createTeam}
        class="p-8 rounded-2xl bg-white shadow-xl flex flex-col gap-8 max-w-sm w-full border"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold">Create team</h1>
          <p class="text-gray-500 text-sm">
            You'll be able to invite people to your team and manage projects
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

        <Button type="submit" class="self-end" loading={submission.pending}>
          Create team
        </Button>
      </form>
    </GridBgContainer>
  );
}
