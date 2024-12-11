import { eq } from "drizzle-orm";
import { db } from "../../database";
import { domainsTable } from "../../database/schema";
import { getSesV2Client } from "../clients";
import { prepareNotificationsForIdentity } from "./notifications";

export async function addDomainToProject(
	{
		teamId,
		projectId,
	}: {
		teamId: string;
		projectId: string;
	},
	domain: string,
) {
	const ses = getSesV2Client();

	const identity = await ses.createEmailIdentity({
		EmailIdentity: domain,
	});

	if (!identity.DkimAttributes?.Tokens) {
		throw new Error("Failed to generate DKIM tokens");
	}

	await db.insert(domainsTable).values({
		domain,
		teamId,
		projectId,
		tokens: identity.DkimAttributes.Tokens,
	});
}

export async function validateIdentityVerification(row: {
	id: string;
	verified: boolean;
	domain: string;
}) {
	const sesClient = getSesV2Client();

	const identity = await sesClient.getEmailIdentity({
		EmailIdentity: row.domain,
	});

	const verified = identity.VerifiedForSendingStatus;

	if (verified !== row.verified) {
		if (verified) {
			await prepareNotificationsForIdentity(row.domain);
		}

		await db
			.update(domainsTable)
			.set({
				verified,
			})
			.where(eq(domainsTable.id, row.id));
	}

	return verified;
}

export async function deleteIdentity(identity: string) {
	const sesClient = getSesV2Client();

	await sesClient.deleteEmailIdentity({
		EmailIdentity: identity,
	});
}
