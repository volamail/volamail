import * as v from "valibot";
import { APIEvent } from "@solidjs/start/server";

/**
 * This endpoint is called by the Amazon SNS webhook
 * to notify us of email events (from Amazon SES).
 * This is used to update the delivery status of
 * emails in the database..
 */
export async function POST({ request }: APIEvent) {
  const body = await request.json();

  console.log(body);

  return {
    success: true,
  };
}
