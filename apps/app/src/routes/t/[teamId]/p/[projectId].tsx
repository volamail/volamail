import {
  A,
  createAsync,
  useParams,
  useSubmission,
  type RouteDefinition,
} from "@solidjs/router";
import { twMerge } from "tailwind-merge";
import { splitProps, type ComponentProps, type JSX } from "solid-js";
import {
  AtSignIcon,
  GlobeIcon,
  KeyIcon,
  LogOutIcon,
  Table2Icon,
} from "lucide-solid";

import { Button } from "~/lib/ui/components/button";
import { logout } from "~/lib/auth/actions";
import { getCurrentUser } from "~/lib/auth/queries";
import { getUserProjects } from "~/lib/projects/queries";
import { ProjectSelector } from "~/lib/ui/components/project-selector";
import { Avatar } from "~/lib/ui/components/avatar";

type Props = {
  children: JSX.Element;
};

export const route: RouteDefinition = {
  load() {
    void getUserProjects();
    void getCurrentUser();
  },
};

export default function DashboardLayout(props: Props) {
  const params = useParams();

  const user = createAsync(() => getCurrentUser(), {
    deferStream: true,
  });

  const logoutAction = useSubmission(logout);

  return (
    <div class="flex">
      <nav class="bg-gray-100 overflow-y-auto border-r h-dvh flex flex-col gap-4 max-w-64 w-full">
        <div class="grow p-4 w-full flex flex-col gap-4">
          <ProjectSelector />

          <hr class="w-full border-gray-200" />

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
                href={`/t/${params.teamId}/p/${params.projectId}/addresses`}
              >
                <AtSignIcon class="size-4" />
                Addresses
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
          </ul>
        </div>

        <form
          action={logout}
          method="post"
          class="flex justify-between items-center gap-2 border-t border-gray-300 p-3"
        >
          <Avatar src={user()?.imageUrl} fallback={user()?.email.charAt(0)!} />
          <span class="text-sm truncate">{user()?.email}</span>
          <Button
            even
            type="submit"
            variant="ghost"
            class="self-end"
            loading={logoutAction.pending}
            icon={() => <LogOutIcon class="size-4" />}
          >
            <span class="sr-only">Logout</span>
          </Button>
        </form>
      </nav>

      <div class="grow">{props.children}</div>
    </div>
  );
}

type NavLinkProps = ComponentProps<typeof A>;

function NavLink(props: NavLinkProps) {
  const [local, others] = splitProps(props, ["class", "activeClass"]);

  return (
    <A
      {...others}
      class={twMerge(
        "w-full text-sm inline-flex gap-2 items-center rounded-md py-1.5 px-2.5 font-medium text-black hover:bg-gray-300 transition-colors cursor-default",
        local.class
      )}
      activeClass={twMerge("bg-gray-200", local.activeClass)}
    />
  );
}
