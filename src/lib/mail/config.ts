import { env } from "../environment/env";

export function getDeliveryNotificationsEnabled() {
	return env.AWS_SNS_TOPIC_ARN !== undefined;
}
