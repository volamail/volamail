import type { UserWithTeams } from "./types";

export const teamMemberAuthorization = defineAuthorization<{
	user: UserWithTeams;
	params: {
		teamId: string;
	};
}>(async (context) => {
	const { user, params } = context;

	return user.teams.some((team) => team.id === params.teamId);
});

export type Authorization<T> = (context: T) => Promise<boolean>;

function defineAuthorization<T>(authorization: Authorization<T>) {
	return authorization;
}
