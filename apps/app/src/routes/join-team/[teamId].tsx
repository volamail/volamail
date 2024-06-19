import {
  createAsync,
  RouteDefinition,
  RouteSectionProps,
} from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { CheckIcon } from "lucide-solid";

import { acceptInvite } from "~/lib/teams/actions";
import { Button } from "~/lib/ui/components/button";
import { getTeamInvite } from "~/lib/teams/queries";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { showToast } from "~/lib/ui/components/toasts";

export const route: RouteDefinition = {
  load({ params }) {
    void getTeamInvite(params.teamId);
  },
};

export default function JoinTeam(props: RouteSectionProps) {
  const invite = createAsync(() => getTeamInvite(props.params.teamId));

  const acceptInviteAction = useMutation({
    action: acceptInvite,
    onSuccess() {
      showToast({
        title: "Invite accepted!",
        variant: "success",
      });
    },
    onError() {
      showToast({
        title: "Unable to accept invite",
        variant: "error",
      });
    },
  });

  return (
    <GridBgContainer>
      <Title>Join team - Volamail</Title>

      <form
        method="post"
        action={acceptInvite}
        class="p-8 rounded-xl bg-white shadow flex flex-col gap-8 max-w-sm w-full border"
      >
        <div class="flex flex-col gap-2">
          <h1 class="text-xl font-medium">Accept team invite</h1>
          <p class="text-gray-600 text-sm">
            You've been invited to collaborate with{" "}
            <span class="font-medium text-black">{invite()?.team.name}</span>.
            This invitation will expire in 48 hours.
          </p>
        </div>

        <input type="hidden" name="teamId" value={props.params.teamId} />

        <Button
          type="submit"
          class="self-end"
          icon={() => <CheckIcon class="size-4" />}
          loading={acceptInviteAction.pending}
        >
          Accept invite
        </Button>
      </form>
    </GridBgContainer>
  );
}
