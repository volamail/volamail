import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "app.config.ts",
    "drizzle.config.ts",
    "app/client.tsx",
    "app/router.tsx",
    "app/ssr.tsx",
    "app/api.ts",
    "app/routeTree.gen.ts",
    "app/routes/**/*.tsx",
    "app/routes/**/*.ts",
    "functions/*.ts",
  ],
  project: ["app/**/*.ts", "app/**/*.tsx"],
};

export default config;
