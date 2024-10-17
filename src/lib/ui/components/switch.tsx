import type { Component } from "solid-js";
import { Show, splitProps } from "solid-js";
import * as SwitchPrimitive from "@kobalte/core/switch";

type RootProps = SwitchPrimitive.SwitchRootProps & {
	label?: string;
	errorMessage?: string;
};

export const Switch: Component<RootProps> = (props) => {
	const [local, others] = splitProps(props, ["label", "errorMessage"]);

	return (
		<SwitchPrimitive.Root {...others}>
			<SwitchPrimitive.Input />
			<div class="items-center flex space-x-2">
				<SwitchPrimitive.Control class="peer inline-flex h-5 w-[2.25rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-black">
					<SwitchPrimitive.Thumb class="pointer-events-none block size-4 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform data-[checked]:translate-x-4" />
				</SwitchPrimitive.Control>
				<div class="grid gap-1.5 leading-none">
					<Show when={local.label}>
						<SwitchPrimitive.Label class="text-sm font-medium leading-none group-data-[disabled]:cursor-not-allowed group-data-[disabled]:opacity-70">
							{local.label}
						</SwitchPrimitive.Label>
					</Show>
					<Show when={local.errorMessage}>
						<SwitchPrimitive.ErrorMessage class="text-sm text-destructive">
							{local.errorMessage}
						</SwitchPrimitive.ErrorMessage>
					</Show>
				</div>
			</div>
		</SwitchPrimitive.Root>
	);
};
