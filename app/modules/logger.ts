import { createConsola } from "consola";
import { env } from "./env";

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
	level: LOG_LEVEL_MAP[env.VITE_LOG_LEVEL ?? DEFAULT_LOG_LEVEL],
});
