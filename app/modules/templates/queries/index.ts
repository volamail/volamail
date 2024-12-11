import { queryOptions } from "@tanstack/react-query";
import { getProjectTemplatesFn } from "./get-project-templates";
import { getTemplateFn } from "./get-template";

export const projectTemplatesQueryOptions = (
	teamId: string,
	projectId: string,
) =>
	queryOptions({
		queryKey: ["team", teamId, "project", projectId, "templates"],
		queryFn: () => {
			return getProjectTemplatesFn({ data: { teamId, projectId } });
		},
	});

export const templateQueryOptions = (
	teamId: string,
	projectId: string,
	slug: string,
) =>
	queryOptions({
		queryKey: ["team", teamId, "project", projectId, "template", slug],
		queryFn: () => getTemplateFn({ data: { teamId, projectId, slug } }),
	});
