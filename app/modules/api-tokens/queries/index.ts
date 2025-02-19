import { queryOptions } from "@tanstack/react-query";
import { getProjectApiTokensFn } from "./get-project-api-tokens";

export const projectApiTokensQueryOptions = (
	teamId: string,
	projectId: string,
) =>
	queryOptions({
		queryKey: ["team", teamId, "project", projectId, "api-tokens"],
		queryFn() {
			return getProjectApiTokensFn({
				data: {
					teamId,
					projectId,
				},
			});
		},
	});
