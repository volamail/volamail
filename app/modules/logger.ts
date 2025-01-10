import { createConsola } from "consola";
import { clientEnv } from "./client-env";

export const DEFAULT_LOG_LEVEL = "info";

export const LOG_LEVEL_MAP = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

export const logger = createConsola({
	defaults: {
		message: "[logger]",
	},
	level: LOG_LEVEL_MAP[clientEnv.VITE_LOG_LEVEL ?? DEFAULT_LOG_LEVEL],
});
