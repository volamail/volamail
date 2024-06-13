import { action } from "@solidjs/router";
import { email, object, parseAsync, pipe, string } from "valibot";

import { db } from "../db";
import { requireUser } from "../auth/utils";
import { addressesTable } from "../db/schema";
import { requireUserToBeMemberOfTeam } from "../projects/utils";

export const createAddress = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const values = Object.fromEntries(formData);

  const body = await parseAsync(
    object({
      teamId: string(),
      address: pipe(string(), email()),
    }),
    values
  );

  await requireUserToBeMemberOfTeam({
    userId: user.id,
    teamId: body.teamId,
  });

  await db.insert(addressesTable).values(body);

  // TODO: Send verification email
  // await sesClient.sendCustomVerificationEmail({
  //   EmailAddress: body.address,
  //   TemplateName: "verify-email",
  // });

  return {
    success: true,
  };
}, "addresses");
