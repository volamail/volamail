import { clientEnv } from "../client-env";

export function getOrigin() {
	const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

	return `${protocol}://${clientEnv.VITE_DOMAIN}`;
}
