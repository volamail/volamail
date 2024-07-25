import { PlusIcon, SendIcon } from "lucide-solid";
import { createSignal } from "solid-js";

import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "~/lib/ui/components/dialog";
import { inviteTeamMember } from "../actions";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  teamId: string;
};

export function InviteMemberDialog(props: Props) {
  const [open, setOpen] = createSignal(false);

  const inviteTeamMemberAction = useMutation({
    action: inviteTeamMember,
    onSuccess() {
      showToast({
        title: "Member invited!",
        variant: "success",
      });

      setOpen(false);
    },
    onError() {
      setOpen(false);

      showToast({
        title: "Unable to invite member",
        variant: "error",
      });
    },
  });

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger
        as={Button}
        class="self-start"
        icon={() => <PlusIcon class="size-4" />}
      >
        Invite member
      </DialogTrigger>
      <DialogContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <DialogTitle>Invite new member</DialogTitle>
          <DialogDescription>
            They will receive an email with a link to join your team.
          </DialogDescription>
        </div>

        <form
          class="flex flex-col gap-4"
          method="post"
          action={inviteTeamMember}
        >
          <input type="hidden" name="teamId" value={props.teamId} />

          <div class="flex flex-col gap-1">
            <label for="email" class="font-medium text-sm">
              Email
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              placeholder="john.doe@example.com"
            />
          </div>

          <Button
            type="submit"
            class="self-end"
            icon={() => <SendIcon class="size-4" />}
            loading={inviteTeamMemberAction.pending}
          >
            Send invite
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
