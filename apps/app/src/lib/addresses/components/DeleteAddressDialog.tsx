import { Trash2Icon } from "lucide-solid";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "~/lib/ui/components/alert-dialog";
import { deleteAddress } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { showToast } from "~/lib/ui/components/toasts";

type Props = {
  teamId: string;
  addressId?: string;
  onClose: () => void;
};

export function DeleteAddressDialog(props: Props) {
  const deleteAddressMutation = useMutation({
    action: deleteAddress,
    onSuccess() {
      showToast({
        title: "Address deleted",
        variant: "success",
      });

      props.onClose();
    },
    onError(e) {
      showToast({
        title: "Unable to delete address",
        variant: "error",
      });
    },
  });

  return (
    <AlertDialog
      open={props.addressId !== undefined}
      onOpenChange={props.onClose}
    >
      <AlertDialogContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <AlertDialogTitle>Delete address</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this address?
          </AlertDialogDescription>
        </div>

        <form
          method="post"
          action={deleteAddress}
          class="flex gap-2 justify-end"
        >
          <input type="hidden" name="teamId" value={props.teamId} />

          <input type="hidden" name="addressId" value={props.addressId} />

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
            loading={deleteAddressMutation.pending}
          >
            Delete
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
