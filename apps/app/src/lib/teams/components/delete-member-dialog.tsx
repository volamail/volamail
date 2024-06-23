import { XIcon } from "lucide-solid";

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
} from "~/lib/ui/components/alert-dialog";
import { deleteMember } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  teamId: string;
  userId?: string;
  onClose: () => void;
};

export function DeleteMemberDialog(props: Props) {
  const deleteMemberMutation = useMutation({
    action: deleteMember,
    onSuccess() {
      showToast({
        title: "Member removed",
        variant: "success",
      });

      props.onClose();
    },
    onError() {
      showToast({
        title: "Unable to remove member",
        variant: "error",
      });
    },
  });

  return (
    <AlertDialog open={props.userId !== undefined} onOpenChange={props.onClose}>
      <AlertDialogContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this member? They will immediately
            lose access to the team.
          </AlertDialogDescription>
        </div>

        <form
          method="post"
          action={deleteMember}
          class="flex gap-2 justify-end"
        >
          <input type="hidden" name="teamId" value={props.teamId} />
          <input type="hidden" name="userId" value={props.userId} />

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
            icon={() => <XIcon class="size-4" />}
            loading={deleteMemberMutation.pending}
          >
            Delete
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
