import { loginWithGithubFn } from "@/modules/auth/mutations/login-with-github";
import { Button } from "@/modules/ui/components/button";
import { GridBgContainer } from "@/modules/ui/components/grid-bg-container";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		mutate: runLoginWithGithub,
		isPending: loginWithGithubPending,
		isSuccess: loginWithGithubSuccess,
	} = useMutation({
		async mutationFn() {
			const to = await loginWithGithubFn();

			window.location.href = to;
		},
	});

	return (
		<GridBgContainer className="flex h-dvh flex-col items-center justify-center bg-grid-small-black/10 p-4 dark:bg-grid-small-white/20">
			<main className="z-10 flex w-full max-w-sm flex-col gap-6 rounded-lg border border-gray-300 bg-gradient-to-br p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl">Login</h1>
					<p className="text-gray-600 text-sm dark:text-gray-400">
						Welcome to Volamail, please sign in to continue.
					</p>
				</div>

				<Button
					padding="lg"
					trailing={<SiGithub className="size-4" />}
					type="submit"
					loading={loginWithGithubPending || loginWithGithubSuccess}
					onClick={() => runLoginWithGithub()}
				>
					Sign in with Github
				</Button>
			</main>
			<footer className="mt-4 text-gray-500 text-xs dark:text-gray-600">
				<a
					href="https://docs.volamail.com/legal/privacy-policy"
					className="transition-colors hover:dark:text-gray-400"
				>
					Privacy
				</a>
				<span className="mx-2">•</span>
				<a
					href="https://docs.volamail.com/legal/terms-of-service"
					className="transition-colors hover:dark:text-gray-400"
				>
					Terms
				</a>
			</footer>
		</GridBgContainer>
	);
}
