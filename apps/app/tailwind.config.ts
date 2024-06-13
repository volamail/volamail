import { sharedConfig } from "@repo/tailwind-config";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx"],
  presets: [sharedConfig],
};
