import { createPreset } from 'fumadocs-ui/tailwind-plugin';
import { sharedConfig } from '@repo/tailwind-config'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  presets: [sharedConfig, createPreset()],
};
