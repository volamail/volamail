import { auth } from "@/modules/auth/auth";
import { logger } from "@/modules/logger";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => {
    logger.info("AUTH URL:", request.url);
    return auth.handler(request);
  },
  POST: ({ request }) => {
    return auth.handler(request);
  },
});
