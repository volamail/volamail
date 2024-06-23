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
