import dotenv from "dotenv";
import devtools from "solid-devtools/vite";
import { defineConfig } from "@solidjs/start/config";

dotenv.config();

export default defineConfig({
  server: {
    preset: "vercel",
    routeRules: {
      "/assets/**": {
        proxy: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/**`,
      },
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
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
  },
});
