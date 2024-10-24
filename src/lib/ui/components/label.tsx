import type { ComponentProps } from "solid-js";
import { tv } from "tailwind-variants";

type Props = ComponentProps<"label">;

const labelVariants = tv({
	base: "text-sm font-medium",
});

export function Label(props: Props) {
	// biome-ignore lint/a11y/noLabelWithoutControl: Not needed for a generic label
	return <label class={labelVariants({ class: props.class })} {...props} />;
}
