import {
  RouteDefinition,
  RouteSectionProps,
  createAsync,
} from "@solidjs/router";
import { Suspense } from "solid-js";
import { Title } from "@solidjs/meta";

import { getTeamSubcription } from "~/lib/subscriptions/queries";

export const route: RouteDefinition = {
  load({ params }) {
    void getTeamSubcription(params.teamId);
  },
};

export default function Usage(props: RouteSectionProps) {
  const subscription = createAsync(() =>
    getTeamSubcription(props.params.teamId)
  );

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Usage and Billing - Volamail</Title>

      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">Usage and Billing</h1>

        <p class="text-gray-600">
          In this page you can monitor your monthly email quota and manage your
          subscription.
        </p>
      </div>

      <section class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold">Usage</h2>

        <div class="border border-gray-300 bg-gray-50 rounded-lg p-4 flex flex-col gap-4">
          <Suspense
            fallback={
              <div class="flex flex-col gap-2">
                <div class="bg-gray-400 animate-pulse rounded-md h-4 w-full" />

                <div class="bg-gray-200 animate-pulse rounded-md h-3 w-32" />

                <div class="bg-gray-300 animate-pulse rounded-md h-3 w-48 mt-4" />
              </div>
            }
          >
            <div class="flex flex-col gap-1">
              <meter
                value={subscription()?.remainingQuota || 0}
                min={0}
                max={subscription()?.monthlyQuota}
                class="w-full"
                id="usage"
              />
              <label for="usage" class="text-sm text-gray-500">
                {subscription()?.remainingQuota} of{" "}
                {subscription()?.monthlyQuota} emails remaining
              </label>
            </div>

            <p class="text-sm text-gray-500">
              Refills at:{" "}
              <span class="font-medium text-black">
                {new Date(
                  subscription()?.renewsAt || 0 + 1000 * 60 * 60 * 24 * 30
                ).toLocaleString("en-US")}
              </span>
            </p>
          </Suspense>
        </div>
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold">Subscription</h2>

        <div class="border border-gray-300 bg-gray-50 rounded-lg p-4 flex flex-col items-start gap-1">
          <Suspense
            fallback={
              <div class="flex flex-col gap-2">
                <div class="bg-gray-200 animate-pulse rounded-md h-4 w-48" />
                <div class="bg-gray-400 animate-pulse rounded-md h-8 p-4" />
              </div>
            }
          >
            <div class="flex gap-2 items-center">
              <p class="font-semibold">
                {subscription()?.tier === "ENTERPRISE"
                  ? "CUSTOM"
                  : subscription()?.tier === "PRO"
                  ? "PRO"
                  : "FREE"}
              </p>
              <div class="inline-block bg-green-100 rounded-full px-1.5 border border-green-600 text-xs text-green-600 font-semibold">
                {subscription()?.status}
              </div>
            </div>

            <p class="text-2xl font-bold">
              {subscription()?.price}${" "}
              <span class="text-sm font-normal">
                /{subscription()?.periodType == "MONTHLY" ? "month" : "year"}
              </span>
            </p>

            <p class="text-sm text-gray-500">
              Renews at:{" "}
              <span class="font-medium text-black">
                {subscription()?.renewsAt.toLocaleString("en-US")}
              </span>
            </p>
          </Suspense>
        </div>
      </section>
    </main>
  );
}
