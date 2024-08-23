import {
  For,
  Show,
  Suspense,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Title } from "@solidjs/meta";
import { LoaderIcon, PlusIcon, Trash2Icon } from "lucide-solid";
import {
  createAsync,
  revalidate,
  type RouteDefinition,
  type RouteSectionProps,
} from "@solidjs/router";

import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "~/lib/ui/components/dialog";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { createDomain } from "~/lib/domains/actions";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { getProjectDomains } from "~/lib/domains/loaders";
import { DeleteDomainDialog } from "~/lib/domains/components/delete-domain-dialog";

export const route: RouteDefinition = {
  load({ params }) {
    void getProjectDomains(params.projectId);
  },
};

export default function DomainsPage(props: RouteSectionProps) {
  const domains = createAsync(() => getProjectDomains(props.params.projectId));

  const [refetching, setRefetching] = createSignal(false);

  const [createDomainDialogOpen, setCreateDomainDialogOpen] =
    createSignal(false);

  const [domainIdToDelete, setDomainIdToDelete] = createSignal<string>();

  const createDomainMutation = useMutation({
    action: createDomain,
    onSuccess() {
      setCreateDomainDialogOpen(false);

      showToast({
        title: "Domain created!",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: e.statusMessage || "Unable to create domain",
        variant: "error",
      });
    },
  });

  onMount(() => {
    const interval = setInterval(async () => {
      setRefetching(true);

      await revalidate(getProjectDomains.keyFor(props.params.projectId));

      setRefetching(false);
    }, 10000);

    onCleanup(() => clearInterval(interval));
  });

  return (
    <main class="p-8 flex flex-col grow gap-4 max-w-4xl">
      <Title>Domains - Volamail</Title>

      <div class="flex flex-col gap-2 mb-6">
        <h1 class="text-3xl font-bold">Domains</h1>

        <p class="text-gray-600">
          Here you can verify and manage the domains you'll be able to send
          emails from.
        </p>
      </div>

      <Suspense
        fallback={
          <div class="flex flex-col gap-2">
            <div class="bg-gray-100 animate-pulse rounded-md h-12 p-4 mb-1">
              <div class="bg-gray-300 animate-pulse rounded-md h-4 w-48" />
            </div>
            <div class="bg-gray-100 animate-pulse rounded-md h-12 p-4">
              <div class="bg-gray-300 animate-pulse rounded-md h-4 w-32" />
            </div>
          </div>
        }
      >
        <Show
          when={domains()?.length}
          fallback={
            <div class="p-4 text-sm max-w-2xl text-gray-600 bg-gray-100 border border-gray-300 rounded-lg text-center">
              No domains set up for this team.
            </div>
          }
        >
          <ul class="flex flex-col gap-2 grow">
            <For each={domains()}>
              {(domain) => (
                <li
                  class="border flex flex-col gap-6 border-gray-300 bg-gray-50 rounded-lg px-3 py-2 text-sm"
                  classList={{
                    "opacity-50": refetching() && !domain.verified,
                  }}
                >
                  <div class="flex justify-between">
                    <div class="flex flex-col gap-0.5">
                      <div class="text-xl font-semibold inline-flex gap-2 items-center">
                        <p>{domain.domain} </p>
                        <Show when={!domain.verified && refetching()}>
                          <LoaderIcon class="size-4 animate-spin" />
                        </Show>
                      </div>
                      <Show
                        when={domain.verified}
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
                    <Button
                      color="destructive"
                      variant="ghost"
                      even
                      class="self-start p-1"
                      icon={() => <Trash2Icon class="size-4" />}
                      aria-label="Delete address"
                      type="button"
                      onClick={() => setDomainIdToDelete(domain.id)}
                    />
                  </div>

                  <Show when={!domain.verified}>
                    <div class="flex flex-col gap-1">
                      <h3 class="font-medium text-lg">DNS records</h3>
                      <p class="text-gray-600 text-sm">
                        Add the following DNS records to your domain's DNS
                        settings to verify the domain.
                      </p>
                      <table class="text-xs mt-2">
                        <thead>
                          <tr class="border-b">
                            <th class="font-medium py-2">Type</th>
                            <th class="font-medium py-2">Name</th>
                            <th class="font-medium py-2">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <For each={domain.tokens}>
                            {(token) => (
                              <tr class="text-gray-600 border-b last:border-b-0">
                                <td class="py-2 pr-4">CNAME</td>
                                <td class="py-2 pr-4">{`${token}._domainkey.${domain.domain}`}</td>
                                <td class="py-2 pr-4">{`${token}.dkim.amazonses.com`}</td>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <Dialog
          open={createDomainDialogOpen()}
          onOpenChange={setCreateDomainDialogOpen}
        >
          <DialogTrigger
            as={Button}
            class="self-start"
            icon={() => <PlusIcon class="size-4" />}
          >
            Add domain
          </DialogTrigger>
          <DialogContent class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <DialogTitle>Verify new domain</DialogTitle>
              <DialogDescription>
                A few DNS entries will be generated. You'll need to add them to
                your domain's DNS settings to verify the domain.
              </DialogDescription>
            </div>

            <form
              class="flex flex-col gap-4"
              action={createDomain}
              method="post"
              autocomplete="off"
            >
              <input
                type="hidden"
                name="projectId"
                value={props.params.projectId}
              />

              <div class="flex flex-col gap-1">
                <label for="domain" class="font-medium text-sm">
                  Domain
                </label>
                <Input
                  id="domain"
                  name="domain"
                  required
                  placeholder="example.com"
                />
              </div>

              <Button
                type="submit"
                class="self-end"
                icon={() => <PlusIcon class="size-4" />}
                loading={createDomainMutation.pending}
              >
                Add domain
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <DeleteDomainDialog
          domainId={domainIdToDelete()}
          projectId={props.params.projectId}
          onClose={() => setDomainIdToDelete()}
        />
      </Suspense>
    </main>
  );
}
