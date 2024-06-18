import { Title } from "@solidjs/meta";
import { CircleCheckBigIcon } from "lucide-solid";
import { RouteSectionProps, createAsync } from "@solidjs/router";

import { getTeam } from "~/lib/teams/queries";
import { editTeam } from "~/lib/teams/actions";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

export default function TeamPage(props: RouteSectionProps) {
  const team = createAsync(() => getTeam(props.params.teamId));

  const editTeamAction = useMutation({
    action: editTeam,
    onSuccess() {
      showToast({
        title: "Changes saved!",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: "Unable to save changes",
        variant: "error",
      });
    },
  });

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Team - Volamail</Title>

      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">Team</h1>

        <p class="text-gray-600">
          In this page you can manage the team members and its settings.
        </p>
      </div>

      <section class="flex flex-col gap-4">
        <h2 class="text-2xl font-semibold">Settings</h2>

        <form class="flex flex-col gap-6" method="post" action={editTeam}>
          <input type="hidden" name="id" value={props.params.teamId} />

          <div class="flex gap-2 w-full">
            <div class="flex flex-col gap-1 grow">
              <label for="id" class="font-medium text-sm">
                Team ID
              </label>
              <Input type="text" id="id" value={props.params.teamId} disabled />
            </div>
            <div class="flex flex-col gap-1 grow">
              <label for="name" class="font-medium text-sm">
                Name
              </label>
              <Input
                type="text"
                name="name"
                id="name"
                value={team()?.name}
                required
              />
              <p class="text-xs text-gray-500">
                This name is only used for display purposes.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            class="self-end"
            icon={() => <CircleCheckBigIcon class="size-4" />}
            loading={editTeamAction.pending}
          >
            Save
          </Button>
        </form>
      </section>
    </main>
  );
}
