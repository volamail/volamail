import { Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { ChevronRightIcon, RotateCwIcon } from "lucide-solid";
import { RouteSectionProps, useSearchParams } from "@solidjs/router";

import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSlot,
} from "~/lib/ui/components/otp-field";
import { Button } from "~/lib/ui/components/button";
import { sendEmailOtp, verifyEmailOtp } from "~/lib/auth/actions";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export default function VerifyMailOtp(props: RouteSectionProps) {
  const verifyOtpAction = useMutation({
    action: verifyEmailOtp,
    onSuccess() {
      showToast({
        title: "Logged in",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: e.statusMessage || "Unable to verify code",
        variant: "error",
      });
    },
  });

  const sendEmailOtpAction = useMutation({
    action: sendEmailOtp,
    onSuccess() {
      showToast({
        title: "Code has been sent",
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

  const [searchParams] = useSearchParams();

  let formRef!: HTMLFormElement;

  return (
    <GridBgContainer class="h-dvh">
      <Title>Verify OTP - Volamail</Title>

      <form
        action={verifyEmailOtp}
        method="post"
        ref={formRef}
        class="shadow-xl border rounded-xl bg-white max-w-sm p-8 flex flex-col items-center gap-2 text-center"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-semibold">Verify OTP</h1>
          <p class="text-gray-600 text-sm">Check your inbox for the code.</p>
        </div>

        <input type="hidden" name="email" value={props.params.email} />

        <Show when={searchParams.to}>
          <input type="hidden" name="to" value={searchParams.to} />
        </Show>

        <OTPField
          maxLength={6}
          class="mt-5"
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

        <div class="flex flex-col gap-2 self-stretch">
          <Button
            type="submit"
            class="self-stretch mt-4 py-2"
            icon={() => <ChevronRightIcon class="size-4" />}
            loading={verifyOtpAction.pending}
          >
            Verify
          </Button>
          <Button
            type="submit"
            class="self-stretch py-1.5"
            variant="outline"
            formAction={sendEmailOtp}
            loading={sendEmailOtpAction.pending}
            icon={() => <RotateCwIcon class="size-4" />}
          >
            Resend code
          </Button>
        </div>
      </form>
    </GridBgContainer>
  );
}
