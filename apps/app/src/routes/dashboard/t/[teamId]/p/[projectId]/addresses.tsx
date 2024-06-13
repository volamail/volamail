import { Title } from "@solidjs/meta";
import {
  type RouteDefinition,
  type RouteSectionProps,
  createAsync,
} from "@solidjs/router";
import { PlusIcon } from "lucide-solid";
import { For, Show, Suspense, createSignal } from "solid-js";
import { createAddress } from "~/lib/addresses/actions";
import { getTeamAddresses } from "~/lib/addresses/queries";
import { Button } from "~/lib/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/lib/ui/components/dialog";
import { Input } from "~/lib/ui/components/input";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

export const route: RouteDefinition = {
  load({ params }) {
    void getTeamAddresses(params.teamId);
  },
};

export default function AddressesPage(props: RouteSectionProps) {
  const addresses = createAsync(() => getTeamAddresses(props.params.teamId));

  const [dialogOpen, setDialogOpen] = createSignal(false);

  const createAddressMutation = useMutation({
    action: createAddress,
    onSuccess() {
      setDialogOpen(false);

      showToast({
        title: "Check your email for verification.",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: "Unable to create address",
        variant: "error",
      });
    },
  });

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Addresses - Voramail</Title>

      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">Addresses</h1>

        <p class="text-gray-600">
          Here you can verify and manage the email addresses you'll be able to
          send emails from.
        </p>
      </div>

      <Suspense
        fallback={
          <div class="flex flex-col gap-2">
            <div class="bg-gray-100 animate-pulse rounded-md h-12 p-4 mb-1 mt-8">
              <div class="bg-gray-300 animate-pulse rounded-md h-4 w-48" />
            </div>
            <div class="bg-gray-100 animate-pulse rounded-md h-12 p-4">
              <div class="bg-gray-300 animate-pulse rounded-md h-4 w-32" />
            </div>
          </div>
        }
      >
        <Show
          when={addresses()?.length}
          fallback={
            <div class="p-4 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg text-center">
              No addresses set up for this team.
            </div>
          }
        >
          <ul class="flex flex-col gap-2 grow">
            <For each={addresses()}>
              {(address) => (
                <li class="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <div class="flex flex-col gap-0.5">
                    <p class="text-sm font-semibold">{address.address}</p>
                    <Show
                      when={address.verified}
                      fallback={
                        <div class="text-xs text-gray-500 inline-flex gap-1 items-center">
                          <div class="size-2 bg-yellow-500 rounded-full" />
                          Pending verification
                        </div>
                      }
                    >
                      <div class="text-xs text-gray-500 inline-flex gap-1 items-center">
                        <div class="size-2 bg-green-500 rounded-full" />
                        Verified
                      </div>
                    </Show>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
          <DialogTrigger
            as={Button}
            class="self-start"
            icon={() => <PlusIcon class="size-4" />}
          >
            Add address
          </DialogTrigger>
          <DialogContent class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <DialogTitle>Verify new address</DialogTitle>
              <DialogDescription>
                A verification email will be sent to the address for
                verification.
              </DialogDescription>
            </div>

            <form
              class="flex flex-col gap-4"
              action={createAddress}
              method="post"
            >
              <input type="hidden" name="teamId" value={props.params.teamId} />

              <div class="flex flex-col gap-1">
                <label for="address" class="font-medium text-sm">
                  Email Address
                </label>
                <Input
                  type="email"
                  id="address"
                  name="address"
                  required
                  placeholder="john@example.com"
                />
              </div>

              <Button
                type="submit"
                class="self-end"
                icon={() => <PlusIcon class="size-4" />}
                loading={createAddressMutation.pending}
              >
                Add address
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Suspense>
    </main>
  );
}
