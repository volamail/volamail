import { env } from "../environment/env";
import { sesClientV1 } from "../mail/send";

export async function prepareNotificationsForIdentity(identity: string) {
  await Promise.all([
    prepareNotificationTypeForIdentiy(identity, "Delivery"),
    prepareNotificationTypeForIdentiy(identity, "Bounce"),
    prepareNotificationTypeForIdentiy(identity, "Complaint"),
  ]);
}

function prepareNotificationTypeForIdentiy(
  identity: string,
  type: "Bounce" | "Delivery" | "Complaint"
) {
  return sesClientV1.setIdentityNotificationTopic({
    Identity: identity,
    NotificationType: type,
    SnsTopic: env.AWS_SNS_TOPIC_ARN,
  });
}
