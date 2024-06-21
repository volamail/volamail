import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | undefined | false>) {
  return twMerge(inputs.filter(Boolean).join(" "));
}
