import type { DbTeam, DbUser } from "../database/schema";

export type UserWithTeams = DbUser & {
	teams: Array<DbTeam>;
};
