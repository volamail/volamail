import { defineConfig } from "@solidjs/start/config";
import devtools from "solid-devtools/vite";

export default defineConfig({
  server: {
    preset: "vercel",
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
