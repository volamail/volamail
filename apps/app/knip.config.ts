import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: [
		"app.config.ts",
		"drizzle.config.ts",
		"tailwind.config.ts",
		"src/app.tsx",
		"src/entry-client.tsx",
		"src/entry-server.tsx",
		"src/middleware.ts",
		"src/routes/**/*.tsx",
		"src/routes/**/*.ts",
	],
	project: ["src/lib/**/*.ts", "src/lib/**/*.tsx"],
};

export default config;
