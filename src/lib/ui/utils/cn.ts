import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | undefined | false>) {
	return twMerge(clsx(...inputs));
}

export function clsx(...inputs: Array<string | undefined | false>) {
	return inputs.filter(Boolean).join(" ");
}
