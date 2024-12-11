import {
	type PostgresJsQueryResultHKT,
	drizzle,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { serverEnv } from "../environment/server";
import * as schema from "./schema";

const client = postgres(serverEnv.DATABASE_URL, {
	prepare: false,
});

export const db = drizzle(client, {
	schema,
});

export type TransactionClient = PgTransaction<
	PostgresJsQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;
