import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp";
import { cn } from "../utils/cn";

interface Props {
	onComplete: (code: string) => void;
	disabled?: boolean;
	pending?: boolean;
}

export function OtpInput({ onComplete, disabled, pending }: Props) {
	return (
		<OTPInput
			disabled={disabled || pending}
			maxLength={6}
			containerClassName={cn(
				"flex items-center justify-between gap-2",
				disabled && "opacity-50",
				pending && "animate-pulse",
			)}
			autoFocus
			pattern={REGEXP_ONLY_DIGITS}
			onComplete={onComplete}
			render={({ slots }) =>
				slots.map((slot, index) => <Slot key={index} {...slot} />)
			}
		/>
	);
}

function Slot(props: SlotProps) {
	return (
		<div className="relative flex size-10 items-center justify-center rounded-md border bg-gray-300 dark:border-gray-600 dark:bg-gray-700">
			<div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
				{props.char ?? props.placeholderChar}
			</div>

			{props.hasFakeCaret && <FakeCaret />}
		</div>
	);
}

function FakeCaret() {
	return (
		<div className="pointer-events-none absolute inset-0 flex animate-caret-blink items-center justify-center">
			<div className="h-4 w-px bg-white" />
		</div>
	);
}
