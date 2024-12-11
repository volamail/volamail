import { queryOptions } from "@tanstack/react-query";
import { getProjectDomainsFn } from "./get-project-domains";

export const projectDomainsOptions = (teamId: string, projectId: string) =>
	queryOptions({
		queryKey: ["team", teamId, "project", projectId, "domains"],
		queryFn() {
			return getProjectDomainsFn({
				data: {
					teamId,
					projectId,
				},
			});
		},
	});
