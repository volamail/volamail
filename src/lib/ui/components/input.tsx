import {
	Show,
	type JSX,
	splitProps,
	createUniqueId,
	type ComponentProps,
} from "solid-js";
import { LoaderIcon } from "lucide-solid";
import { type VariantProps, tv } from "tailwind-variants";

import { clsx } from "../utils/cn";

const inputVariants = tv({
	base: "inline-flex flex-col gap-1",
	slots: {
		wrapper:
			'w-full relative has-[:disabled]:bg-gray-100 has-[input:focus]:outline outline-blue-600 flex gap-2 px-2.5 items-center bg-white border rounded-lg border-gray-300 has-[input[aria-invalid="true"]]:border-red-500',
		input:
			"py-1.5 text-input outline-none text-sm w-full bg-transparent disabled:bg-gray-100 disabled:text-gray-500",
		loader: "animate-spin size-4",
		hint: "text-xs text-gray-500",
		error: "text-xs text-red-500",
	},
});

type Props = ComponentProps<"input"> & {
	leading?: () => JSX.Element;
	trailing?: () => JSX.Element;
	loading?: boolean;
	resizeable?: boolean;
} & VariantProps<typeof inputVariants> & {
		classes?: {
			container?: string;
			wrapper?: string;
			input?: string;
			loader?: string;
			hint?: string;
			error?: string;
		};
		label?: string;
		hint?: string;
		error?: string;
	};

export function Input(props: Props) {
	const [local, rest] = splitProps(props, [
		"trailing",
		"leading",
		"loading",
		"disabled",
		"class",
		"classes",
		"resizeable",
		"label",
		"hint",
		"error",
		"id",
	]);

	const id = local.id || createUniqueId();

	return (
		<div
			class={inputVariants().base({
				class: clsx(local.classes?.container, local.class),
			})}
		>
			<Show when={local.label}>
				<label class="text-sm font-medium" for={id}>
					{local.label}
				</label>
			</Show>

			<div class={inputVariants().wrapper(local.classes?.wrapper)}>
				<Show when={local.leading}>{local.leading!()}</Show>

				<input
					{...rest}
					id={id}
					disabled={local.disabled || local.loading}
					aria-invalid={!!local.error}
					aria-describedby={local.error ? `${id}-error` : undefined}
					class={inputVariants().input({ class: local.classes?.input })}
					style={{
						// @ts-expect-error css types aren't up to date
						"field-sizing": local.resizeable ? "content" : undefined,
					}}
				/>

				<Show
					when={local.loading}
					fallback={local.trailing ? local.trailing() : null}
				>
					<LoaderIcon
						class={inputVariants().loader({ class: local.classes?.loader })}
					/>
				</Show>
			</div>

			<Show
				when={local.error}
				fallback={
					<Show when={local.hint}>
						<p class={inputVariants().hint(local.classes?.hint)}>
							{local.hint}
						</p>
					</Show>
				}
			>
				<p
					id={`${id}-error`}
					class={inputVariants().error(local.classes?.error)}
				>
					{local.error}
				</p>
			</Show>
		</div>
	);
}
