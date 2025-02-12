import { authClient } from "@/modules/auth/client";
import { GridBgContainer } from "@/modules/ui/components/grid-bg-container";
import { OtpInput } from "@/modules/ui/components/otp-input";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
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

	const [verifying, setVerifying] = useState(false);

	const navigate = useNavigate();

	async function handleOtpSubmit(otp: string) {
		setVerifying(true);

		const result = await authClient.signIn.emailOtp({
			email: params.email,
			otp,
		});

		setVerifying(false);

		if (result.error) {
			toast.error("Verification failed");

			return;
		}

		navigate({
			to: search.next ?? "/",
		});
	}

	return (
		<GridBgContainer className="flex h-dvh flex-col items-center justify-center bg-grid-small-black/10 p-4 dark:bg-grid-small-white/20">
			<main className="z-10 flex w-full max-w-sm flex-col gap-12 rounded-lg border border-gray-300 bg-gradient-to-br p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950">
				<div className="flex flex-col gap-2">
					<h1 className="font-semibold text-2xl">Verify OTP</h1>
					<p className="text-gray-600 text-sm dark:text-gray-400">
						Please enter the verification code sent to your email.
					</p>
				</div>

				<OtpInput onComplete={handleOtpSubmit} pending={verifying} />
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
