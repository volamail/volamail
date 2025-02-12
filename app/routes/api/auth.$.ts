import { auth } from "@/modules/auth/auth";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/auth/$")({
	GET: ({ request }) => {
		return auth.handler(request);
	},
	POST: ({ request }) => {
		return auth.handler(request);
	},
});
