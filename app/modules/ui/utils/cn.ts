import { twMerge } from "tailwind-merge";
import type { ClassValue } from "tailwind-variants";

export function cn(...classes: ClassValue[]) {
	return twMerge(classes.filter(Boolean).join(" "));
}
