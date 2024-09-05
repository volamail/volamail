import {
	Navigate,
	createAsync,
	useSearchParams,
	type RouteDefinition,
} from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { AlertCircleIcon, GithubIcon, SendIcon } from "lucide-solid";

import { getAuthState } from "~/lib/auth/queries";
import { Input } from "~/lib/ui/components/input";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { getAppEnvironmentInfo } from "~/lib/environment/loaders";
import { loginWithGithub, sendEmailOtp } from "~/lib/auth/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export const route: RouteDefinition = {
	load() {
		void getAuthState();
		void getAppEnvironmentInfo();
	},
};

export default function Login() {
	const [searchParams] = useSearchParams();

	const authState = createAsync(() => getAuthState());
	const env = createAsync(() => getAppEnvironmentInfo());

	const loginWithGithubAction = useMutation({
		action: loginWithGithub,
	});

	const mailOtpAction = useMutation({
		action: sendEmailOtp,
		onSuccess() {
			showToast({
				title: "OTP sent!",
				variant: "success",
			});
		},
		onError(e) {
			showToast({
				title: e.statusMessage || "Unable to send OTP",
				variant: "error",
			});
		},
	});

	const [navigating, setNavigating] = createSignal(false);

	onMount(() => {
		function handleUnload() {
			setNavigating(true);
		}

		window.addEventListener("beforeunload", handleUnload);

		onCleanup(() => {
			window.removeEventListener("beforeunload", handleUnload);
		});
	});

	if (authState()?.authenticated) {
		return <Navigate href="/teams" />;
	}

	return (
		<GridBgContainer class="h-dvh p-4">
			<Title>Login - Volamail</Title>

			<div class="shadow-xl z-50 border rounded-xl bg-white max-w-sm w-full p-8 flex flex-col gap-3">
				<form action={sendEmailOtp} method="post" class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<h1 class="text-xl font-semibold">Login</h1>
						<p class="text-gray-600 text-sm">
							Sign in to your account to start working on your team's emails.
						</p>
					</div>

					<Show when={searchParams.to}>
						<input type="hidden" name="to" value={searchParams.to} />
					</Show>

					<div class="flex flex-col gap-2">
						<Input
							type="email"
							name="email"
							required
							placeholder="john.doe@example.com"
							value={searchParams.email || ""}
						/>

						<Button
							type="submit"
							class="justify-center py-2"
							loading={mailOtpAction.pending}
							icon={() => <SendIcon class="size-4" />}
						>
							Sign in with email
						</Button>
					</div>
					<Show when={searchParams.error}>
						<div class="text-red-500 mt-4 bg-red-100 rounded-lg border-red-500 p-3 text-sm inline-flex gap-2 items-start">
							<AlertCircleIcon class="size-5 shrink-0" />
							<p>{searchParams.error}</p>
						</div>
					</Show>
				</form>

				<Show when={env()?.auth.githubEnabled}>
					<div class="flex gap-3 items-center">
						<hr class="w-full border-gray-200" />
						<span class="text-sm text-gray-500">or</span>
						<hr class="w-full border-gray-200" />
					</div>

					<form
						action={loginWithGithub}
						method="post"
						class="flex flex-col gap-4"
					>
						<Button
							type="submit"
							class="justify-center py-2"
							variant="outline"
							loading={loginWithGithubAction.pending || navigating()}
							icon={() => <GithubIcon class="size-4" />}
						>
							Sign in with GitHub
						</Button>
					</form>
				</Show>
			</div>
		</GridBgContainer>
	);
}
