import { authClient } from "@/modules/auth/client";
import { zodValidator } from "@/modules/rpcs/validator";
import { Button } from "@/modules/ui/components/button";
import { GridBgContainer } from "@/modules/ui/components/grid-bg-container";
import { TextInput } from "@/modules/ui/components/text-input";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
	validateSearch: zodValidator(
		z.object({
			next: z.string().optional(),
		}),
	),
});

function RouteComponent() {
	const navigate = useNavigate();
	const search = Route.useSearch();

	const {
		mutate: runLoginWithGithub,
		isPending: loginWithGithubPending,
		isSuccess: loginWithGithubSuccess,
	} = useMutation({
		async mutationFn() {
			await authClient.signIn.social({
				provider: "github",
				callbackURL: search.next || "/",
			});
		},
	});

	async function handleEmailSubmit(e: React.FormEvent) {
		e.preventDefault();

		const formData = new FormData(e.target as HTMLFormElement);

		const email = formData.get("email") as string;

		await authClient.emailOtp.sendVerificationOtp({
			type: "sign-in",
			email,
		});

		await navigate({
			to: "/verify-otp/$email",
			params: {
				email,
			},
			search: {
				next: search.next,
			},
		});
	}

	return (
		<GridBgContainer className="flex h-dvh flex-col items-center justify-center bg-grid-small-black/10 p-4 dark:bg-grid-small-white/20">
			<main className="z-10 flex w-full max-w-sm flex-col gap-12 rounded-lg border border-gray-300 bg-gradient-to-br p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl">Sign In</h1>
					<p className="text-gray-600 text-sm dark:text-gray-400">
						Welcome, please sign in to continue.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<Button
						padding="lg"
						trailing={<SiGithub className="size-4" />}
						type="submit"
						loading={loginWithGithubPending || loginWithGithubSuccess}
						onClick={() => runLoginWithGithub()}
					>
						Sign in with Github
					</Button>

					<div className="flex items-center gap-2">
						<hr className="flex-1 border dark:border-gray-700" />
						<span className="text-gray-500 text-xs">or</span>
						<hr className="flex-1 border dark:border-gray-700" />
					</div>

					<form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
						<TextInput
							aria-label="Email"
							type="email"
							className="w-full"
							name="email"
							placeholder="me@example.com"
							required
						/>

						<Button type="submit" padding="lg" color="neutral">
							Sign in with email
						</Button>
					</form>
				</div>
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
