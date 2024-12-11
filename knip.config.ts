import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: [
		"app.config.ts",
		"drizzle.config.ts",
		"app/client.tsx",
		"app/router.tsx",
		"app/ssr.tsx",
		"app/routeTree.gen.ts",
		"app/routes/**/*.tsx",
	],
	project: ["src/lib/**/*.ts", "src/lib/**/*.tsx"],
};

export default config;
