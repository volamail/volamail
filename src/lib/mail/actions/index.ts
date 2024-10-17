import { action } from "@solidjs/router";
import { sendTestMail as sendTestMailMutation } from "./sendTestEmail";

export const sendTestMail = action(sendTestMailMutation);
