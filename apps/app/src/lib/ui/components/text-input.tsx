import { Field, type FieldInputProps } from "@ark-ui/solid";
import { type JSXElement, Show, splitProps } from "solid-js";
import { tv } from "tailwind-variants";
import { Label } from "./label";

const styles = tv({
	slots: {
		container: "inline-flex flex-col gap-1",
		wrapper:
			'w-full bg-white relative has-[:disabled]:bg-gray-100 has-[input:focus]:outline outline-blue-600 flex gap-2 px-2 items-center bg-white border rounded-lg border-gray-200 has-[input[aria-invalid="true"]]:border-red-500',
		input:
			"py-1 text-input outline-none text-sm w-full bg-transparent disabled:bg-gray-100 disabled:text-gray-500",
		hint: "text-xs text-gray-500",
		error: "text-xs text-red-500",
	},
});

type Props = FieldInputProps & {
	label?: JSXElement;
	error?: JSXElement;
	hint?: JSXElement;
	invalid?: boolean;
	classes?: {
		container?: string;
		wrapper?: string;
		input?: string;
		hint?: string;
		error?: string;
	};
};

export function TextInput(props: Props) {
	const [local, rest] = splitProps(props, [
		"label",
		"error",
		"hint",
		"classes",
		"invalid",
	]);

	return (
		<Field.Root
			invalid={local.invalid}
			class={styles().container({
				class: local.classes?.container,
			})}
		>
			<Show when={local.label}>
				<Field.Label
					asChild={(labelProps) => <Label {...labelProps}>{local.label}</Label>}
				/>
			</Show>

			<div class={styles().wrapper({ class: local.classes?.wrapper })}>
				<Field.Input
					{...rest}
					class={styles().input({ class: local.classes?.input })}
				/>
			</div>

			<Show when={local.hint}>
				<Field.HelperText class={styles().hint({ class: local.classes?.hint })}>
					{local.hint}
				</Field.HelperText>
			</Show>

			<Show when={local.error}>
				<Field.ErrorText
					class={styles().error({ class: local.classes?.error })}
				>
					{local.error}
				</Field.ErrorText>
			</Show>
		</Field.Root>
	);
}
