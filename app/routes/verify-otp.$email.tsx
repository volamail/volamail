import { authClient } from "@/modules/auth/client";
import { Button } from "@/modules/ui/components/button";
import { GridBgContainer } from "@/modules/ui/components/grid-bg-container";
import { OtpInput } from "@/modules/ui/components/otp-input";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Redo2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/verify-otp/$email")({
	component: VerifyOtp,
	validateSearch: zodValidator(
		z.object({
			next: z.string().optional(),
		}),
	),
});

function VerifyOtp() {
	const params = Route.useParams();
	const search = Route.useSearch();

	const navigate = useNavigate();

	const verifyMutation = useMutation({
		mutationFn: async (otp: string) => {
			const result = await authClient.signIn.emailOtp({
				email: params.email,
				otp,
			});

			if (result.error) {
				throw result.error;
			}
		},
		onError() {
			toast.error("Verification failed");
		},
		async onSuccess() {
			await navigate({
				to: search.next ?? "/",
			});
		},
	});

	const { countdown, restart: restartCountdown } = useCountdown(15);

	const resendMutation = useMutation({
		mutationFn: async () => {
			restartCountdown();

			await authClient.emailOtp.sendVerificationOtp({
				type: "sign-in",
				email: params.email,
			});
		},
	});

	return (
		<GridBgContainer className="flex h-dvh flex-col items-center justify-center bg-grid-small-black/10 p-4 dark:bg-grid-small-white/20">
			<main className="z-10 flex w-full max-w-sm flex-col gap-12 rounded-lg border border-gray-300 bg-gradient-to-br p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl">Verify OTP</h1>
					<p className="text-gray-600 text-sm dark:text-gray-400">
						Please enter the verification code sent to your email.
					</p>
				</div>

				<div className="flex flex-col gap-4">
					<OtpInput
						onComplete={verifyMutation.mutate}
						pending={verifyMutation.isPending}
					/>

					<Button
						padding="lg"
						color="neutral"
						trailing={countdown === 0 && <Redo2Icon className="size-4" />}
						loading={resendMutation.isPending}
						onClick={() => resendMutation.mutate()}
						disabled={countdown > 0}
					>
						Resend code {countdown > 0 && `(${countdown}s)`}
					</Button>
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

function useCountdown(seconds: number) {
	const [countdown, setCountdown] = useState(seconds);

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return {
		countdown,
		restart: () => setCountdown(seconds),
	};
}
