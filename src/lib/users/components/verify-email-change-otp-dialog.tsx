import { ChevronRightIcon } from "lucide-solid";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "~/lib/ui/components/dialog";
import {
	OTPField,
	OTPFieldGroup,
	OTPFieldInput,
	OTPFieldSlot,
} from "~/lib/ui/components/otp-field";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { verifyEmailChangeOtp } from "~/lib/auth/actions";

type Props = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	email: string;
};

export function VerifyEmailChangeOtpDialog(props: Props) {
	const verifyOtpMutation = useMutation({
		action: verifyEmailChangeOtp,
		onSuccess() {
			showToast({
				title: "Email changed!",
				variant: "success",
			});

			props.onOpenChange?.(false);
		},
		onError(e) {
			showToast({
				title: e.statusMessage || "Unable to verify code",
				variant: "error",
			});
		},
	});

	let formRef!: HTMLFormElement;

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent
				as="form"
				method="post"
				action={verifyEmailChangeOtp}
				ref={formRef}
			>
				<DialogTitle>Verify new email</DialogTitle>

				<DialogDescription>
					A verification code has been sent to the new email address. Please
					enter it below to verify it.
				</DialogDescription>

				<input type="hidden" name="email" value={props.email} />

				<OTPField
					maxLength={6}
					class="mt-4 self-center justify-center"
					onComplete={() => formRef.requestSubmit()}
				>
					<OTPFieldInput name="code" />
					<OTPFieldGroup>
						<OTPFieldSlot index={0} />
						<OTPFieldSlot index={1} />
						<OTPFieldSlot index={2} />
						<OTPFieldSlot index={3} />
						<OTPFieldSlot index={4} />
						<OTPFieldSlot index={5} />
					</OTPFieldGroup>
				</OTPField>

				<Button
					type="submit"
					class="justify-self-end mt-4"
					icon={() => <ChevronRightIcon class="size-4" />}
					loading={verifyOtpMutation.pending}
				>
					Verify
				</Button>
			</DialogContent>
		</Dialog>
	);
}
