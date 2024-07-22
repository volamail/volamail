import { Trash2Icon } from "lucide-solid";
import { Button } from "~/lib/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/lib/ui/components/dialog";
import { deleteAccount } from "../actions";
import { Input } from "~/lib/ui/components/input";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { createSignal, createMemo } from "solid-js";

const CONFIRM_TEXT = "delete me";

export function DeleteAccoutDialog() {
  const [open, setOpen] = createSignal(false);

  const [confirmText, setConfirmText] = createSignal("");

  const disabled = createMemo(
    () => confirmText().toLowerCase() !== CONFIRM_TEXT.toLowerCase()
  );

  const deleteAccountMutation = useMutation({
    action: deleteAccount,
    onSuccess() {
      showToast({
        title: "Account deleted",
        variant: "success",
      });

      setOpen(false);
    },
    onError(e) {
      console.log(e);

      showToast({
        title: "Unable to delete account",
        variant: "error",
      });
    },
  });

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger
        as={Button}
        color="destructive"
        variant="outline"
        class="self-start"
        icon={() => <Trash2Icon class="size-4" />}
      >
        Delete account
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Delete account</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete your account?
        </DialogDescription>

        <p class="text-sm text-gray-600">
          This operation cannot be undone and it will also do the following
          things:
        </p>

        <ul class="text-sm list-disc pl-6 text-gray-600 flex flex-col gap-2">
          <li>All projects in your personal team will be deleted.</li>
          <li>
            All teams that you're the only remaining member of will be deleted
            (and with them all the projects for that team).
          </li>
          <li>
            Verified domains will be deleted. If you'll use them in another
            project in the future you'll have to verify them again, with
            different DNS records.
          </li>
        </ul>

        <p class="text-sm text-gray-600">
          If you're 100% sure, type{" "}
          <code class="bg-gray-200 px-1">{CONFIRM_TEXT}</code> in the input
          below to confirm.
        </p>

        <form
          method="post"
          action={deleteAccount}
          class="flex gap-2 justify-end flex-col"
        >
          <Input
            type="text"
            name="confirm"
            id="confirm"
            required
            aria-label="Confirmation"
            autocomplete="off"
            value={confirmText()}
            onInput={(event) => setConfirmText(event.target.value)}
          />

          <div class="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              class="self-end"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              color="destructive"
              class="self-end"
              icon={() => <Trash2Icon class="size-4" />}
              loading={deleteAccountMutation.pending}
              disabled={disabled()}
            >
              Delete
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
