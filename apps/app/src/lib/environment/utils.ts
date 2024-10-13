export function isSelfHosted() {
	// Intentionally don't use `env.ts` to make it
	// work in the browser
	return import.meta.env.VITE_SELF_HOSTED === "true";
}
