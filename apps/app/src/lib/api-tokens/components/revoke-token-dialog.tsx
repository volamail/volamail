import { Trash2Icon } from "lucide-solid";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "~/lib/ui/components/alert-dialog";
import { revokeApiToken } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  projectId: string;
  tokenId?: string;
  onClose: () => void;
};

export function RevokeTokenDialog(props: Props) {
  const revokeTokenMutation = useMutation({
    action: revokeApiToken,
    onSuccess() {
      showToast({
        title: "Token revoked",
        variant: "success",
      });

      props.onClose();
    },
    onError(e) {
      console.log(e);
      showToast({
        title: "Unable to revoke token",
        variant: "error",
      });
    },
  });

  return (
    <AlertDialog
      open={props.tokenId !== undefined}
      onOpenChange={props.onClose}
    >
      <AlertDialogContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <AlertDialogTitle>Revoke token</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to revoke this token? API calls that use this
            token will stop working.
          </AlertDialogDescription>
        </div>

        <form
          method="post"
          action={revokeApiToken}
          class="flex gap-2 justify-end"
        >
          <input type="hidden" name="projectId" value={props.projectId} />

          <input type="hidden" name="id" value={props.tokenId} />

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
            loading={revokeTokenMutation.pending}
          >
            Delete
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
