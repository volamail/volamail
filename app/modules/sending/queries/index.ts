import { queryOptions } from "@tanstack/react-query";
import { getEmailLogs } from "./get-email-logs";

export const projectLogsOptions = (params: {
	teamId: string;
	projectId: string;
	page: number;
}) =>
	queryOptions({
		queryKey: [
			"team",
			params.teamId,
			"project",
			params.projectId,
			"logs",
			params.page,
		],
		queryFn() {
			return getEmailLogs({
				data: {
					teamId: params.teamId,
					projectId: params.projectId,
					page: params.page,
				},
			});
		},
	});
