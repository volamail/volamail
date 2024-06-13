import { eq } from "drizzle-orm";
import { cache } from "@solidjs/router";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { addressesTable } from "../db/schema";
import { requireUserToBeMemberOfTeam } from "../projects/utils";

export const getTeamAddresses = cache(async (teamId: string) => {
  "use server";

  const user = requireUser();

  await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId,
  });

  return await db.query.addressesTable.findMany({
    where: eq(addressesTable.teamId, teamId),
  });
}, "addresses");
