import {
  A,
  createAsync,
  RouteDefinition,
  RouteSectionProps,
  useSearchParams,
} from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { createMemo, For, Show, Suspense } from "solid-js";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid";

import { cn } from "~/lib/ui/utils/cn";
import { Button } from "~/lib/ui/components/button";
import { getProjectEmails } from "~/lib/mail/loaders";

export const route: RouteDefinition = {
  load({ params }) {
    void getProjectEmails(params.projectId);
  },
};

export default function Logs(props: RouteSectionProps) {
  const [searchParams] = useSearchParams();

  const page = createMemo(() => Number(searchParams.page) || 0);

  const emails = createAsync(() =>
    getProjectEmails(props.params.projectId, page())
  );

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-6xl">
      <Title>Logs - Volamail</Title>
      <div class="flex flex-col gap-3">
        <h1 class="text-3xl font-bold">Logs</h1>
        <p class="text-gray-600">
          In this page you can view the emails you sent and their status.
        </p>
      </div>

      <Suspense
        fallback={
          <div class="w-full h-48 animate-pulse rounded-lg bg-gray-100" />
        }
      >
        <Show when={emails()}>
          <div class="flex flex-col gap-2">
            <table class="text-sm overflow-hidden border rounded-lg border-separate bg-gray-50 border-gray-300 border-spacing-0">
              <thead>
                <tr>
                  <th class="text-left font-medium py-2 px-3 border-b border-gray-300">
                    To
                  </th>
                  <th class="text-left font-medium py-2 px-3 border-b border-gray-300">
                    From
                  </th>
                  <th class="text-left font-medium py-2 px-3 border-b border-gray-300">
                    Subject
                  </th>
                  <th class="text-left font-medium py-2 px-3 border-b border-gray-300">
                    Time
                  </th>
                  <th class="text-left font-medium py-2 px-3 border-b border-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={emails()?.rows?.length}
                  fallback={
                    <tr>
                      <td class="p-4 text-center text-gray-500" colspan="5">
                        No emails sent yet.
                      </td>
                    </tr>
                  }
                >
                  <For each={emails()?.rows}>
                    {(email) => (
                      <tr class="even:bg-gray-100">
                        <td class="py-2 px-3">{email.to}</td>
                        <td class="py-2 px-3">{email.from}</td>
                        <td class="py-2 px-3 truncate max-w-64">
                          {email.subject}
                        </td>
                        <td class="py-2 px-3">
                          {new Date(email.sentAt).toLocaleString("en-US")}
                        </td>
                        <td class="py-2 px-3">
                          <span
                            class={cn(
                              "px-1.5 py-0.5 text-xs rounded-full border",
                              email.status === "SENT"
                                ? "bg-gray-100 text-gray-500 border-gray-200"
                                : email.status === "DELIVERED"
                                ? "bg-green-100 text-green-600 border-green-200"
                                : "bg-red-100 text-red-600 border-red-200"
                            )}
                          >
                            {email.status === "SENT"
                              ? "Sent"
                              : email.status === "DELIVERED"
                              ? "Delivered"
                              : email.status === "BOUNCED"
                              ? "Bounced"
                              : "Complained"}
                          </span>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </tbody>
            </table>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">
                Page {page() + 1} of {emails()?.pages} - showing{" "}
                {emails()?.rows.length} rows of {emails()?.total}
              </span>
              <div class="flex justify-end gap-1">
                <Button
                  as={A}
                  href={page() <= 1 ? "#" : `?page=${page() - 1}`}
                  even
                  variant="outline"
                  disabled={page() === 0}
                  class="p-1"
                >
                  <ChevronLeftIcon class="size-4" />
                </Button>
                <Button
                  as={A}
                  href={`?page=${page() + 1}`}
                  even
                  variant="outline"
                  class="p-1"
                  disabled={page() === emails()!.pages - 1}
                >
                  <ChevronRightIcon class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Show>
      </Suspense>
    </main>
  );
}
