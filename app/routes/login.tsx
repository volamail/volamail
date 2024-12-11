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
		<GridBgContainer className="h-dvh flex flex-col items-center justify-center bg-grid-small-black/10 dark:bg-grid-small-white/10">
			<main className="z-10 max-w-sm rounded-lg w-full shadow-2xl border flex flex-col gap-6 border-gray-300 dark:border-gray-700 bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 p-12">
				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-semibold">Login</h1>
					<p className="text-gray-600 dark:text-gray-400 text-sm">
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
			<footer className="text-gray-500 dark:text-gray-600 text-xs mt-4">
				<a
					href="https://docs.volamail.com/legal/privacy-policy"
					className="hover:dark:text-gray-400 transition-colors"
				>
					Privacy
				</a>
				<span className="mx-2">•</span>
				<a
					href="https://docs.volamail.com/legal/terms-of-service"
					className="hover:dark:text-gray-400 transition-colors"
				>
					Terms
				</a>
			</footer>
		</GridBgContainer>
	);
}
