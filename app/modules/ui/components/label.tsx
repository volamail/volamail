import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

type Props = ComponentProps<"label">;

const labelVariants = tv({
	base: "text-sm font-medium",
});

export function Label(props: Props) {
	const { className, ...rest } = props;

	// biome-ignore lint/a11y/noLabelWithoutControl: Not needed for a generic label
	return <label className={labelVariants({ className })} {...rest} />;
}
