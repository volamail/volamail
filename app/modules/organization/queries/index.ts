import { queryOptions } from "@tanstack/react-query";
import { getProjectFn } from "./get-project";
import { getTeamFn } from "./get-team";
import { getTeamInviteFn } from "./get-team-invite";
import { getTeamInvitesFn } from "./get-team-invites";
import { getTeamMembersFn } from "./get-team-members";
import { getTeamUsageFn } from "./get-team-usage";
import { getUserTeamsFn } from "./get-user-teams";

export const projectQueryOptions = (teamId: string, projectId: string) =>
	queryOptions({
		queryKey: ["team", teamId, "project", projectId],
		queryFn() {
			return getProjectFn({
				data: {
					teamId,
					projectId,
				},
			});
		},
	});

export const teamQueryOptions = (teamId: string) =>
	queryOptions({
		queryKey: ["team", teamId],
		queryFn() {
			return getTeamFn({
				data: { teamId },
			});
		},
	});

export const teamMembersOptions = (teamId: string) =>
	queryOptions({
		queryKey: ["team", teamId, "members"],
		queryFn() {
			return getTeamMembersFn({
				data: {
					teamId,
				},
			});
		},
	});

export const teamInvitesOptions = (teamId: string) =>
	queryOptions({
		queryKey: ["team", teamId, "invites"],
		queryFn() {
			return getTeamInvitesFn({
				data: { teamId },
			});
		},
	});

export const teamInviteOptions = (code: string) =>
	queryOptions({
		queryKey: ["invite", code],
		queryFn() {
			return getTeamInviteFn({ data: { code } });
		},
	});

export const userTeamsOptions = () =>
	queryOptions({
		queryKey: ["user", "teams"],
		queryFn() {
			return getUserTeamsFn();
		},
	});

export const teamUsageOptions = (teamId: string) =>
	queryOptions({
		queryKey: ["team", teamId, "usage"],
		queryFn() {
			return getTeamUsageFn({
				data: {
					teamId,
				},
			});
		},
	});
