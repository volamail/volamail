import { serverEnv } from "../environment/server";

export function getOrigin() {
	const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

	return `${protocol}://${serverEnv.VITE_DOMAIN}`;
}
