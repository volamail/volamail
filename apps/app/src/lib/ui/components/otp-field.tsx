import OtpField, { type DynamicProps, type RootProps } from "@corvu/otp-field";
import {
	type Component,
	type ComponentProps,
	Show,
	type ValidComponent,
	splitProps,
} from "solid-js";

import { cn } from "../utils/cn";

const OTPField = <T extends ValidComponent = "div">(
	props: DynamicProps<T, RootProps<T> & { class?: string | undefined }>,
) => {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<OtpField
			class={cn(
				"flex items-center gap-2 disabled:cursor-not-allowed has-[:disabled]:opacity-50",
				local.class,
			)}
			{...others}
		/>
	);
};

const OTPFieldInput = OtpField.Input;

const OTPFieldGroup: Component<ComponentProps<"div">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);

	return <div class={cn("flex items-center", local.class)} {...others} />;
};

const OTPFieldSlot: Component<ComponentProps<"div"> & { index: number }> = (
	props,
) => {
	const [local, others] = splitProps(props, ["class", "index"]);
	const context = OtpField.useContext();
	const char = () => context.value()[local.index];
	const showFakeCaret = () =>
		context.value().length === local.index && context.isInserting();

	return (
		<div
			class={cn(
				"group relative flex size-10 items-center justify-center border-y border-r border-gray-300 text-sm first:rounded-l-md first:border-l last:rounded-r-md",
				local.class,
			)}
			{...others}
		>
			<div
				class={cn(
					"absolute inset-0 z-10 transition-all group-first:rounded-l-md group-last:rounded-r-md",
					context.activeSlots().includes(local.index) &&
						"outline outline-blue-500",
				)}
			/>
			{char()}
			<Show when={showFakeCaret()}>
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div class="h-4 w-px animate-caret-blink bg-black duration-1000" />
				</div>
			</Show>
		</div>
	);
};

export { OTPField, OTPFieldInput, OTPFieldGroup, OTPFieldSlot };
