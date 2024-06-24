import { S3 } from "@aws-sdk/client-s3";
import { env } from "../env";

export function getMediaUrl(id: string) {
  return `${import.meta.env.DEV ? "http" : "https"}://${
    env.SITE_DOMAIN
  }/assets/media/${id}`;
}

export const s3 = new S3({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
