import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import {
	type PostgresJsQueryResultHKT,
	drizzle,
} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Resource } from "sst";

import * as schema from "./schema";

const client = postgres(Resource.DatabaseUrl.value, {
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
