import dotenv from "dotenv";
import devtools from "solid-devtools/vite";
import { defineConfig } from "@solidjs/start/config";
import packageJSON from "./package.json";

dotenv.config();

export default defineConfig({
  server: {
    preset: process.env.VITE_SELF_HOSTED === "true" ? "node" : "vercel",
    routeRules: {
      "/assets/**": {
        proxy: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/**`,
      },
      "/api/**": {
        cors: true,
      },
    },
  },
  middleware: "./src/middleware.ts",
  vite: {
    plugins: [
      devtools({
        autoname: true,
      }),
    ],
    define: {
      "import.meta.env.VITE_PUBLIC_APP_VERSION": JSON.stringify(
        packageJSON.version
      ),
    },
    envPrefix: "VITE_",
  },
});
