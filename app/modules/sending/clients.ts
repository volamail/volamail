import { SES } from "@aws-sdk/client-ses";
import { SESv2 } from "@aws-sdk/client-sesv2";

export function getSesV2Client() {
	return new SESv2();
}

export function getSesV1Client() {
	return new SES();
}
