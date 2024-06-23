import { Trash2Icon } from "lucide-solid";

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
} from "~/lib/ui/components/alert-dialog";
import { deleteInvite } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  teamId: string;
  email?: string;
  onClose: () => void;
};

export function DeleteInviteDialog(props: Props) {
  const deleteInviteMutation = useMutation({
    action: deleteInvite,
    onSuccess() {
      showToast({
        title: "Invite revoked",
        variant: "success",
      });

      props.onClose();
    },
    onError() {
      props.onClose();

      showToast({
        title: "Unable to delete invite",
        variant: "error",
      });
    },
  });

  return (
    <AlertDialog open={props.email !== undefined} onOpenChange={props.onClose}>
      <AlertDialogContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <AlertDialogTitle>Revoke invite</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke this invite? The invited user has
            already received the invitation email, but they won't be able to
            join the team anymore.
          </AlertDialogDescription>
        </div>

        <form
          method="post"
          action={deleteInvite}
          class="flex gap-2 justify-end"
        >
          <input type="hidden" name="teamId" value={props.teamId} />
          <input type="hidden" name="email" value={props.email} />

          <Button
            type="button"
            variant="outline"
            class="self-end"
            onClick={props.onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            color="destructive"
            class="self-end"
            icon={() => <Trash2Icon class="size-4" />}
            loading={deleteInviteMutation.pending}
          >
            Delete
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
