import { env } from "../env";

export function getMediaUrl(id: string) {
  return `${import.meta.env.DEV ? "http" : "https"}://${
    env.SITE_DOMAIN
  }/assets/media/${id}`;
}