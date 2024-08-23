import {
  Show,
  type JSX,
  splitProps,
  type ComponentProps,
  createSignal,
  createMemo,
} from "solid-js";
import {
  KeyIcon,
  MailIcon,
  GlobeIcon,
  ImageIcon,
  UsersIcon,
  AtSignIcon,
  LogOutIcon,
  Table2Icon,
  BookOpenIcon,
  SettingsIcon,
  LanguagesIcon,
  CreditCardIcon,
  PanelLeftCloseIcon,
  PanelRightCloseIcon,
  MessageCircleQuestionIcon,
} from "lucide-solid";
import {
  A,
  useParams,
  createAsync,
  useSubmission,
  type RouteDefinition,
} from "@solidjs/router";
import { twMerge } from "tailwind-merge";
import { tv, VariantProps } from "tailwind-variants";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/lib/ui/components/tooltip";
import { logout } from "~/lib/auth/actions";
import { getTeam } from "~/lib/teams/loaders";
import { getUserTeams } from "~/lib/teams/loaders";
import { getCurrentUser } from "~/lib/auth/queries";
import { Avatar } from "~/lib/ui/components/avatar";
import { isSelfHosted } from "~/lib/environment/utils";
import { getAppEnvironmentInfo } from "~/lib/environment/loaders";
import { Button, buttonVariants } from "~/lib/ui/components/button";
import { ProjectSelector } from "~/lib/projects/components/project-selector";

type Props = {
  children: JSX.Element;
};

export const route: RouteDefinition = {
  load({ params }) {
    void getUserTeams();
    void getCurrentUser();
    void getTeam(params.teamId);
    void getAppEnvironmentInfo();
  },
};

export default function DashboardLayout(props: Props) {
  const params = useParams();

  const user = createAsync(() => getCurrentUser());
  const env = createAsync(() => getAppEnvironmentInfo());

  const logoutAction = useSubmission(logout);

  const [sidebarExpanded, setSidebarExpanded] = createSignal(true);

  const environmentString = createMemo(() => {
    return `v${env()?.instance.version} - ${
      env()?.instance.prod ? "prod" : "dev"
    } - ${env()?.instance.selfHosted ? "SH" : "CH"}`;
  });

  return (
    <div class="flex">
      <div
        class="h-dvh bg-gray-100 p-3 border-r"
        classList={{ hidden: sidebarExpanded() }}
      >
        <Button
          icon={() => <PanelRightCloseIcon class="size-4" />}
          variant="ghost"
          aria-label="Open sidebar"
          even
          onClick={() => setSidebarExpanded(true)}
        />
      </div>
      <nav
        class="bg-gray-100 overflow-y-auto border-r h-dvh flex-col max-w-64 shrink-0"
        classList={{
          flex: sidebarExpanded(),
          hidden: !sidebarExpanded(),
        }}
      >
        <div class="grow p-3 w-full flex flex-col">
          <div class="flex flex-col gap-4">
            <Show when={params.projectId} keyed>
              <div class="flex gap-2 items-center">
                <ProjectSelector />
                <Button
                  aria-label="Close sidebar"
                  icon={() => <PanelLeftCloseIcon class="size-4" />}
                  variant="ghost"
                  even
                  onClick={() => setSidebarExpanded(false)}
                />
              </div>
            </Show>

            <hr class="w-full border-gray-200" />

            <section class="flex flex-col gap-2">
              <h3 class="font-semibold text-xs text-gray-500 pl-2.5">
                PROJECT
              </h3>

              <ul class="flex flex-col gap-1 grow">
                <li>
                  <NavLink
                    href={`/t/${params.teamId}/p/${params.projectId}/emails`}
                  >
                    <Table2Icon class="size-4" />
                    Emails
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href={`/t/${params.teamId}/p/${params.projectId}/media`}
                  >
                    <ImageIcon class="size-4" />
                    Media
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href={`/t/${params.teamId}/p/${params.projectId}/logs`}
                  >
                    <MailIcon class="size-4" />
                    Logs
                  </NavLink>
                </li>
                <li>
                  <NavLink disabled>
                    <div class="grow flex gap-2 items-center">
                      <GlobeIcon class="size-4" />
                      Audiences
                    </div>
                    <div class="rounded-full bg-yellow-100 border border-yellow-500 px-1.5 text-xs text-yellow-600">
                      Soon
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink disabled>
                    <div class="grow flex gap-2 items-center">
                      <LanguagesIcon class="size-4" />
                      Languages
                    </div>
                    <div class="rounded-full bg-yellow-100 border border-yellow-500 px-1.5 text-xs text-yellow-600">
                      Soon
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href={`/t/${params.teamId}/p/${params.projectId}/tokens`}
                  >
                    <KeyIcon class="size-4" />
                    API tokens
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href={`/t/${params.teamId}/p/${params.projectId}/domains`}
                  >
                    <AtSignIcon class="size-4" />
                    Domains
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href={`/t/${params.teamId}/p/${params.projectId}/settings`}
                  >
                    <SettingsIcon class="size-4" />
                    Settings
                  </NavLink>
                </li>
              </ul>
            </section>

            <section class="flex flex-col gap-2">
              <h3 class="font-semibold text-xs text-gray-500 pl-2.5">TEAM</h3>

              <ul class="flex flex-col gap-1 grow">
                <Show when={!isSelfHosted()}>
                  <li>
                    <NavLink
                      href={`/t/${params.teamId}/p/${params.projectId}/usage`}
                    >
                      <CreditCardIcon class="size-4" />
                      Usage & Billing
                    </NavLink>
                  </li>
                </Show>
                <li>
                  <NavLink
                    href={`/t/${params.teamId}/p/${params.projectId}/team`}
                  >
                    <UsersIcon class="size-4" />
                    Team settings
                  </NavLink>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <p class="text-gray-300 self-stretch text-center text-xs px-4 py-2">
          {environmentString()}
        </p>

        <form
          action={logout}
          method="post"
          class="flex justify-start items-center gap-2 border-t border-gray-200 p-3"
        >
          <Button
            as={A}
            href="profile"
            variant="ghost"
            class="grow px-1.5 gap-2 hover:bg-white"
          >
            <Avatar
              src={user()?.imageUrl}
              fallback={user()?.name.charAt(0) || ""}
            />
            <p class="text-sm truncate grow">{user()?.name}</p>
          </Button>
          <div class="flex gap-1 items-center shrink-0">
            <Tooltip>
              <TooltipTrigger
                as="a"
                href="mailto:info@volamail.com"
                aria-label="Support"
                class={buttonVariants({ variant: "ghost", even: true })}
              >
                <MessageCircleQuestionIcon class="size-4" />
              </TooltipTrigger>
              <TooltipContent>Support</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                as="a"
                href="https://docs.volamail.com"
                target="_blank"
                aria-label="Docs"
                class={buttonVariants({ variant: "ghost", even: true })}
              >
                <BookOpenIcon class="size-4" />
              </TooltipTrigger>
              <TooltipContent>Docs</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                as={Button}
                type="submit"
                variant="ghost"
                even
                class="self-end"
                loading={logoutAction.pending}
                icon={() => <LogOutIcon class="size-4" />}
                aria-label="Logout"
              />
              <TooltipContent>Logout</TooltipContent>
            </Tooltip>
          </div>
        </form>
      </nav>

      <div class="grow">{props.children}</div>
    </div>
  );
}

const navLinkVariants = tv({
  base: "w-full text-sm inline-flex gap-2 items-center rounded-md py-1.5 px-2.5 font-medium text-black hover:bg-gray-300 transition-colors cursor-default",
  variants: {
    disabled: {
      true: "opacity-50 cursor-not-allowed pointer-events-none",
      false: "",
    },
  },
});

type NavLinkProps = Omit<ComponentProps<typeof A>, "href"> &
  VariantProps<typeof navLinkVariants> &
  (
    | { disabled: true; href?: undefined }
    | {
        href: string;
        disabled?: false;
      }
  );

function NavLink(props: NavLinkProps) {
  const [local, others] = splitProps(props, [
    "class",
    "activeClass",
    "disabled",
  ]);

  if (local.disabled) {
    return (
      <button
        class={navLinkVariants({ disabled: local.disabled })}
        aria-disabled={local.disabled}
        type="button"
      >
        {others.children}
      </button>
    );
  }

  return (
    <A
      {...others}
      href={others.href!}
      class={navLinkVariants()}
      activeClass={twMerge("bg-gray-200", local.activeClass)}
    />
  );
}
