import {
	NumberInput as ArkNumberInput,
	Field,
	type FieldRootProps,
	type NumberInputRootProps,
} from "@ark-ui/solid";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-solid";
import { type JSXElement, Show, splitProps } from "solid-js";
import { tv } from "tailwind-variants";
import { Label } from "./label";

type Props = NumberInputRootProps & {
	label?: JSXElement;
	hint?: JSXElement;
	error?: JSXElement;
	classes?: {
		container?: string;
		label?: string;
		control?: string;
		input?: string;
	};
};

const numberInputVariants = tv({
	slots: {
		container: "min-w-0 w-full inline-flex flex-col gap-1",
		control:
			"min-w-0 inline-flex bg-white border border-gray-200 rounded-lg has-[:focus]:outline outline-blue-600",
		input: "min-w-0 rounded-l-lg outline-none bg-white text-sm px-2 py-1",
	},
});

export function NumberInput(props: Props) {
	const [local, rest] = splitProps(props, [
		"label",
		"classes",
		"hint",
		"error",
	]);

	return (
		<Field.Root
			disabled={rest.disabled}
			invalid={rest.invalid}
			required={rest.required}
		>
			<ArkNumberInput.Root
				{...rest}
				class={numberInputVariants().container({
					class: local.classes?.container,
				})}
			>
				<ArkNumberInput.Scrubber />
				<Show when={local.label}>
					<ArkNumberInput.Label
						asChild={(labelProps) => (
							<Label {...labelProps} class={local.classes?.label}>
								{local.label}
							</Label>
						)}
					/>
				</Show>
				<div
					class={numberInputVariants().control({
						class: local.classes?.control,
					})}
				>
					<ArkNumberInput.Input
						class={numberInputVariants().input({
							class: local.classes?.input,
						})}
					/>
					<ArkNumberInput.Control class="flex flex-col border-l border-gray-200">
						<ArkNumberInput.IncrementTrigger class="grow py-0.5 px-1 border-b border-gray-200">
							<ChevronUpIcon class="size-3" />
						</ArkNumberInput.IncrementTrigger>
						<ArkNumberInput.DecrementTrigger class="grow py-0.5 px-1">
							<ChevronDownIcon class="size-3" />
						</ArkNumberInput.DecrementTrigger>
					</ArkNumberInput.Control>
				</div>
			</ArkNumberInput.Root>
			<Show when={local.hint}>
				<Field.HelperText>{local.hint}</Field.HelperText>
			</Show>
			<Show when={local.error}>
				<Field.ErrorText>{local.error}</Field.ErrorText>
			</Show>
		</Field.Root>
	);
}
