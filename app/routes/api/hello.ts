import { logger } from "@/modules/logger";
import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/hello")({
	GET: () => {
		logger.info("hello API called");

		return json({ message: "Hello from Volamail!" });
	},
});
