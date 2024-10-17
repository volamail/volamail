import { LoaderIcon } from "lucide-solid";
import { type VariantProps, tv } from "tailwind-variants";
import {
	createUniqueId,
	Show,
	splitProps,
	type ComponentProps,
	type JSX,
} from "solid-js";
import { clsx } from "../utils/cn";

const textareaVariants = tv({
	base: "inline-flex flex-col gap-1",
	slots: {
		wrapper:
			'w-full relative has-[:disabled]:bg-gray-100 has-[input:focus]:outline outline-blue-600 flex gap-2 px-2.5 items-center bg-white border rounded-lg border-gray-300 has-[textarea[aria-invalid="true"]]:border-red-500',
		input:
			"py-1.5 text-input resize-none outline-none text-sm w-full bg-transparent disabled:bg-gray-100 disabled:text-gray-500",
		loader: "animate-spin size-4",
		hint: "text-xs text-gray-500",
		error: "text-xs text-red-500",
	},
});

type Props = ComponentProps<"textarea"> & {
	leading?: () => JSX.Element;
	trailing?: () => JSX.Element;
	loading?: boolean;
	resizeable?: boolean;
	submitOnEnter?: boolean;
} & VariantProps<typeof textareaVariants> & {
		classes?: {
			container?: string;
			wrapper?: string;
			input?: string;
			loader?: string;
			hint?: string;
			error?: string;
		};
		error?: string;
		hint?: string;
		label?: string;
	};

export function Textarea(props: Props) {
	const [local, rest] = splitProps(props, [
		"trailing",
		"leading",
		"loading",
		"disabled",
		"class",
		"classes",
		"resizeable",
		"label",
		"submitOnEnter",
		"hint",
		"error",
		"id",
	]);

	const id = local.id || createUniqueId();

	return (
		<div
			class={textareaVariants().base({
				class: clsx(local.classes?.container, local.class),
			})}
		>
			<Show when={local.label}>
				<label class="text-sm font-medium" for={id}>
					{local.label}
				</label>
			</Show>
			<div class={textareaVariants().wrapper(local.classes?.wrapper)}>
				<Show when={local.leading}>{local.leading!()}</Show>

				<textarea
					{...rest}
					rows={rest.rows || 1}
					aria-invalid={!!local.error}
					aria-describedby={local.error ? `${id}-error` : undefined}
					disabled={local.disabled || local.loading}
					class={textareaVariants().input({ class: local.classes?.input })}
					style={{
						// @ts-expect-error css types aren't up to date
						"field-sizing": local.resizeable ? "content" : undefined,
					}}
					onKeyDown={(event) => {
						if (local.submitOnEnter && event.key === "Enter") {
							event.preventDefault();

							const target = event.target as HTMLTextAreaElement;

							target.form!.requestSubmit();
						}
					}}
				/>

				<Show
					when={local.loading}
					fallback={local.trailing ? local.trailing() : null}
				>
					<LoaderIcon
						class={textareaVariants().loader({ class: local.classes?.loader })}
					/>
				</Show>
			</div>
			<Show
				when={local.error}
				fallback={
					<Show when={local.hint}>
						<p class={textareaVariants().hint(local.classes?.hint)}>
							{local.hint}
						</p>
					</Show>
				}
			>
				<p
					id={`${id}-error`}
					class={textareaVariants().error(local.classes?.error)}
				>
					{local.error}
				</p>
			</Show>
		</div>
	);
}
