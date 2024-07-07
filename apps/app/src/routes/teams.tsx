import { For, Show, Suspense } from "solid-js";
import { A, createAsync } from "@solidjs/router";
import { BookOpenIcon, LogOutIcon } from "lucide-solid";

import { logout } from "~/lib/auth/actions";
import { getUserTeams } from "~/lib/teams/queries";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export default function Teams() {
  const teams = createAsync(() => getUserTeams());

  const logoutAction = useMutation({
    action: logout,
    onSuccess() {
      showToast({
        title: "Logged out, you're being redirect...",
        variant: "success",
      });
    },
    onError() {
      showToast({
        title: "Unable to log out",
        variant: "error",
      });
    },
  });

  return (
    <GridBgContainer class="h-dvh flex flex-col justify-center items-center p-8">
      <div class="max-w-4xl w-full flex z-10 flex-col gap-2 max-h-[80%] h-full">
        <main class="bg-white rounded-xl overflow-y-auto grow p-8 shadow border border-gray-300 flex flex-col gap-6">
          <Suspense
            fallback={
              <>
                <div class="flex flex-col gap-2">
                  <div class="bg-gray-300 animate-pulse rounded-md h-8 w-24" />
                  <div class="flex gap-2">
                    <div class="bg-gray-200 animate-pulse w-48 h-24 rounded-lg p-4" />
                    <div class="bg-gray-200 animate-pulse w-48 h-24 rounded-lg p-4" />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <div class="bg-gray-300 animate-pulse rounded-md h-8 w-24" />
                  <div class="flex gap-2">
                    <div class="bg-gray-200 animate-pulse w-48 h-24 rounded-lg p-4" />
                    <div class="bg-gray-200 animate-pulse w-48 h-24 rounded-lg p-4" />
                    <div class="bg-gray-200 animate-pulse w-48 h-24 rounded-lg p-4" />
                  </div>
                </div>
              </>
            }
          >
            <section class="flex flex-col gap-2">
              <h2 class="text-xl font-semibold">Personal projects</h2>
              <Show when={teams()?.personal?.projects.length}>
                <ul class="flex gap-2">
                  <For each={teams()?.personal?.projects}>
                    {(project) => (
                      <li>
                        <A
                          href={`/t/${project.teamId}/p/${project.id}/emails`}
                          class="flex flex-col justify-end gap-0.5 hover:bg-gray-200 rounded-lg px-2.5 py-2 text-sm bg-gray-100 w-48 h-24 shadow-sm transition-colors cursor-default"
                        >
                          <p class="font-medium">{project.name}</p>
                        </A>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </section>

            <For each={teams()?.other}>
              {(team) => (
                <section class="flex flex-col gap-2">
                  <h2 class="text-xl font-semibold">{team.name}</h2>
                  <ul class="flex gap-2">
                    <For each={team.projects}>
                      {(project) => (
                        <li>
                          <A
                            href={`/t/${project.teamId}/p/${project.id}/emails`}
                            class="flex flex-col justify-end gap-0.5 hover:bg-gray-200 rounded-lg px-2.5 py-2 text-sm bg-gray-100 w-48 h-24 shadow-sm transition-colors cursor-default"
                          >
                            <p class="font-medium">{project.name}</p>
                          </A>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          </Suspense>
        </main>
        <footer class="flex justify-end gap-2 w-full">
          <Button
            as={A}
            href="https://docs.volamail.com"
            target="_blank"
            variant="ghost"
            icon={() => <BookOpenIcon class="size-4" />}
          >
            Docs
          </Button>
          <form action={logout} method="post">
            <Button
              variant="ghost"
              type="submit"
              loading={logoutAction.pending}
              icon={() => <LogOutIcon class="size-4" />}
            >
              Logout
            </Button>
          </form>
        </footer>
      </div>
    </GridBgContainer>
  );
}
