import type { ComponentProps } from "solid-js";
import { tv } from "tailwind-variants";

type Props = ComponentProps<"label">;

const labelVariants = tv({
	base: "text-sm font-medium",
});

export function Label(props: Props) {
	return <label class={labelVariants({ class: props.class })} {...props} />;
}
