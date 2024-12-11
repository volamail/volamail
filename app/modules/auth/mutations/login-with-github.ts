import { createServerFn } from "@tanstack/start";
import { signInWithGithub } from "../github";

export const loginWithGithubFn = createServerFn({ method: "POST" }).handler(
	() => {
		return signInWithGithub();
	},
);
