import {
  ArrowRightIcon,
  CircleCheck,
  CircleIcon,
  LoaderIcon,
  UserCheck2,
} from "lucide-solid";
import { For, Show, Suspense } from "solid-js";
import { createResource, createSignal } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";

import { searchWaitlist } from "../queries";
import { approveToWaitlist } from "../actions";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/lib/ui/components/dialog";
import { Input } from "~/lib/ui/components/input";

export function ApproveToWaitlistDialog() {
  const approveToWaitlistAction = useMutation({
    action: approveToWaitlist,
    onSuccess() {
      showToast({
        title: "User approved",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: "Unable to approve user",
        variant: "error",
      });
    },
  });

  const [search, setSearch] = createSignal("");

  const [selectedEmail, setSelectedEmail] = createSignal<string | null>(null);

  const [users] = createResource(search() || false, searchWaitlist);

  function toggleEmailSelection(email: string) {
    if (selectedEmail() === email) {
      return setSelectedEmail(null);
    }

    setSelectedEmail(email);
  }

  const handleSearchInput = debounce((message: string) => {
    setSearch(message);

    setSelectedEmail(null);
  }, 300);

  return (
    <Dialog>
      <DialogTrigger
        as={Button}
        icon={() => <UserCheck2 class="size-4" />}
        aria-label="Approve users"
        even
        variant="ghost"
      />
      <DialogContent
        as="form"
        method="post"
        class="flex flex-col"
        action={approveToWaitlist}
      >
        <DialogTitle>Approve user early access</DialogTitle>

        <div class="flex flex-col gap-2">
          <Input
            type="text"
            name="search"
            placeholder="Search users"
            aria-label="Search users"
            loading={users.loading}
            onInput={(event) => handleSearchInput(event.target.value)}
          />

          <div
            class="border border-gray-300 rounded-lg h-64 overflow-y-auto bg-gray-100 flex flex-col relative p-1 gap-1"
            role="listbox"
          >
            <Suspense
              fallback={<LoaderIcon class="size-4 mx-auto my-2 animate-spin" />}
            >
              <Show
                when={users()?.length}
                fallback={
                  <p class="text-center text-sm text-gray-500 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    {search()
                      ? "No users in the waitlist yet."
                      : "Search for users by email"}
                  </p>
                }
              >
                <For each={users()}>
                  {(user) => (
                    <button
                      type="button"
                      class="cursor-default rounded-md w-full text-sm flex justify-between items-center py-2 px-3 border shadow-sm bg-white border-gray-300"
                      role="option"
                      aria-selected={selectedEmail() === user.email}
                      onClick={() => toggleEmailSelection(user.email)}
                    >
                      <span class="block font-medium truncate">
                        {user.email}
                      </span>
                      <Show
                        when={selectedEmail() === user.email}
                        fallback={<CircleIcon class="size-5" />}
                      >
                        <div class="relative size-5">
                          <CircleCheck class="absolute inset-0 size-5 bg-black text-white rounded-full " />
                          <CircleCheck class="absolute inset-0 size-5 bg-black text-white rounded-full animate-ping repeat-1" />
                        </div>
                      </Show>
                    </button>
                  )}
                </For>
              </Show>
            </Suspense>
          </div>
        </div>

        <Show when={selectedEmail()}>
          <input type="hidden" name="email" value={selectedEmail()!} />
        </Show>

        <Button
          type="submit"
          class="self-end"
          disabled={!selectedEmail()}
          loading={approveToWaitlistAction.pending}
          icon={() => <ArrowRightIcon class="size-4" />}
        >
          Approve user
        </Button>
      </DialogContent>
    </Dialog>
  );
}
