import { Title } from "@solidjs/meta";
import { Navigate, type RouteSectionProps, createAsync } from "@solidjs/router";
import {
  CircleCheckBigIcon,
  LoaderIcon,
  Trash2Icon,
  XIcon,
} from "lucide-solid";
import { For, Match, Show, Switch, createSignal } from "solid-js";

import { editTeam } from "~/lib/teams/actions";
import { DeleteInviteDialog } from "~/lib/teams/components/delete-invite-dialog";
import { DeleteMemberDialog } from "~/lib/teams/components/delete-member-dialog";
import { DeleteTeamDialog } from "~/lib/teams/components/delete-team-dialog";
import { InviteMemberDialog } from "~/lib/teams/components/invite-member-dialog";
import { getTeam } from "~/lib/teams/queries";
import { Button } from "~/lib/ui/components/button";
import { Input } from "~/lib/ui/components/input";
import { showToast } from "~/lib/ui/components/toasts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/lib/ui/components/tooltip";
import { useMutation } from "~/lib/ui/hooks/useMutation";

export default function TeamPage(props: RouteSectionProps) {
  const team = createAsync(() => getTeam(props.params.teamId));

  if (team()?.personal) {
    return (
      <Navigate
        href={`/t/${props.params.teamId}/p/${props.params.projectId}/emails`}
      />
    );
  }

  const [memberToDelete, setMemberToDelete] = createSignal<string>();
  const [inviteToDelete, setInviteToDelete] = createSignal<string>();

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
          In this page you can manage the team's settings and members.
        </p>
      </div>

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Members</h2>

        <table class="text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left font-medium py-2">Email</th>
              <th class="text-left font-medium py-2">Member since</th>
            </tr>
          </thead>
          <tbody>
            <For each={team()?.members}>
              {(member) => (
                <tr>
                  <td class="py-2 pr-4">{member.user.email}</td>
                  <td class="py-2 pr-4">
                    {member.joinedAt.toLocaleDateString("en-US")}
                  </td>

                  {/* @ts-expect-error idk align attribute is deprecated or something*/}
                  <td align="right">
                    <Tooltip>
                      <TooltipTrigger
                        as={Button}
                        color="destructive"
                        variant="ghost"
                        class="self-end p-1"
                        icon={() => <XIcon class="size-4" />}
                        aria-label="Remove member"
                        type="button"
                        even
                        disabled={
                          member.userId === team()?.personalTeamOwner?.id ||
                          team()?.members.length === 1
                        }
                        onClick={() => setMemberToDelete(member.userId)}
                      />
                      <TooltipContent class="text-gray-600">
                        <Switch fallback={<p>Remove member</p>}>
                          <Match
                            when={
                              member.userId === team()?.personalTeamOwner?.id
                            }
                          >
                            <p>Can't remove the personal team owner</p>
                          </Match>
                          <Match when={team()?.members.length === 1}>
                            <p>
                              Can't remove the last member. Scroll down to the
                              "Danger zone" to remove the whole team.
                            </p>
                          </Match>
                        </Switch>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>

        <DeleteMemberDialog
          teamId={props.params.teamId}
          userId={memberToDelete()}
          onClose={() => setMemberToDelete()}
        />

        <Show when={team()?.invites.length}>
          <section class="flex flex-col gap-1 mt-3">
            <h2 class="font-semibold inline-flex gap-2 items-center">
              Pending invites{" "}
              <LoaderIcon class="size-4 animate-spin text-gray-500" />
            </h2>

            <table class="text-sm">
              <thead>
                <tr class="border-b">
                  <th class="text-left font-medium py-2">Email</th>
                  <th class="text-left font-medium py-2">Sent at</th>
                </tr>
              </thead>
              <tbody>
                <For each={team()?.invites}>
                  {(invite) => (
                    <tr>
                      <td class="py-2 pr-4">{invite.email}</td>
                      <td class="py-2 pr-4">
                        {invite.createdAt.toLocaleString("en-US")}
                      </td>
                      {/* @ts-expect-error idk align attribute is deprecated or something*/}
                      <td align="right">
                        <Button
                          color="destructive"
                          variant="ghost"
                          class="self-end p-1"
                          icon={() => <XIcon class="size-4" />}
                          aria-label="Revoke invitation"
                          type="button"
                          even
                          onClick={() => setInviteToDelete(invite.email)}
                        />
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </section>
        </Show>

        <InviteMemberDialog teamId={props.params.teamId} />

        <DeleteInviteDialog
          teamId={props.params.teamId}
          email={inviteToDelete()}
          onClose={() => setInviteToDelete()}
        />
      </section>

      <hr class="w-full border-gray-200" />

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Settings</h2>

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
                disabled={team()?.personal}
              />
              <p class="text-xs text-gray-500">
                This name is only used for display purposes.{" "}
                <Show when={team()?.personal}>
                  <span>It's disabled for personal teams.</span>
                </Show>
              </p>
            </div>
          </div>

          <Button
            type="submit"
            class="self-end"
            icon={() => <CircleCheckBigIcon class="size-4" />}
            loading={editTeamAction.pending}
            disabled={team()?.personal}
          >
            Save
          </Button>
        </form>
      </section>

      <hr class="w-full border-gray-200" />

      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Danger zone</h2>

        <DeleteTeamDialog teamId={props.params.teamId} />
      </section>
    </main>
  );
}
