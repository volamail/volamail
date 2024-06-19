import { Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { RouteSectionProps, useSearchParams } from "@solidjs/router";

import { verifyEmailOtp } from "~/lib/auth/actions";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { showToast } from "~/lib/ui/components/toasts";
import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSlot,
} from "~/lib/ui/components/otp-field";
import { Button } from "~/lib/ui/components/button";
import { CheckIcon } from "lucide-solid";

export default function VerifyMailOtp(props: RouteSectionProps) {
  const verifyOtpAction = useMutation({
    action: verifyEmailOtp,
    onSuccess() {
      showToast({
        title: "Logged in!",
        variant: "success",
      });
    },
    onError(e) {
      showToast({
        title: "Unable to verify code",
        variant: "error",
      });
    },
  });

  const [searchParams] = useSearchParams();

  let formRef!: HTMLFormElement;

  return (
    <GridBgContainer>
      <Title>Verify OTP - Volamail</Title>

      <form
        action={verifyEmailOtp}
        method="post"
        ref={formRef}
        class="shadow-xl border rounded-xl bg-white max-w-sm p-8 flex flex-col items-center gap-1 text-center"
      >
        <h1 class="text-2xl font-semibold">Verify OTP</h1>
        <p class="text-gray-600 text-sm">Check your inbox for the code.</p>

        <input type="hidden" name="email" value={props.params.email} />

        <Show when={searchParams.to}>
          <input type="hidden" name="to" value={searchParams.to} />
        </Show>

        <OTPField
          maxLength={6}
          class="mt-5"
          onComplete={() => formRef.submit()}
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
          class="self-stretch mt-2 py-2"
          icon={() => <CheckIcon class="size-4" />}
          loading={verifyOtpAction.pending}
        >
          Verify
        </Button>
      </form>
    </GridBgContainer>
  );
}
