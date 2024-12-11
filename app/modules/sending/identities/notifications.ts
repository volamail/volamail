import { Resource } from "sst";
import { getSesV1Client } from "../clients";

export async function prepareNotificationsForIdentity(identity: string) {
	await Promise.all([
		prepareNotificationTypeForIdentiy(identity, "Delivery"),
		prepareNotificationTypeForIdentiy(identity, "Bounce"),
		prepareNotificationTypeForIdentiy(identity, "Complaint"),
	]);
}

function prepareNotificationTypeForIdentiy(
	identity: string,
	type: "Bounce" | "Delivery" | "Complaint",
) {
	const sesClient = getSesV1Client();

	return sesClient.setIdentityNotificationTopic({
		Identity: identity,
		NotificationType: type,
		SnsTopic: Resource.EmailNotificationsTopic.arn,
	});
}
