import { env } from "../env";

export function getOrigin() {
	const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

	return `${protocol}://${env.VITE_DOMAIN}`;
}
