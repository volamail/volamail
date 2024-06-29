import { Navigate, createAsync, type RouteDefinition } from "@solidjs/router";

import { getCurrentUserDefaultProject } from "~/lib/projects/queries";

export const route: RouteDefinition = {
  load() {
    void getCurrentUserDefaultProject();
  },
};

export default function Dashboard() {
  const project = createAsync(() => getCurrentUserDefaultProject(), {
    deferStream: true,
  });

  if (!project()) {
    return <Navigate href="/404" />;
  }

  return (
    <Navigate href={`/t/${project()?.teamId}/p/${project()?.id}/emails`} />
  );
}
