import { ark } from "@ark-ui/react";
import { LoaderIcon } from "lucide-react";
import {
	type ComponentProps,
	type ReactNode,
	cloneElement,
	isValidElement,
} from "react";
import { type VariantProps, tv } from "tailwind-variants";
import { mergeReactProps } from "../utils/merge-react-props";
import { buttonStyles } from "./button";

const styles = tv({
	extend: buttonStyles,
	variants: {
		padding: {
			sm: "p-1",
			md: "p-2",
			lg: "p-3",
		},
	},
});

type ActionButtonProps = ComponentProps<typeof ark.button> &
	VariantProps<typeof styles>;

export function ActionButton(props: ActionButtonProps) {
	const { children, loading, asChild, disabled, ...rest } = props;

	function getChildWithLoader(child: ReactNode) {
		return loading ? <LoaderIcon className="size-4 animate-spin" /> : child;
	}

	return (
		<ark.button
			{...rest}
			className={styles({ ...rest, loading })}
			disabled={loading || disabled}
		>
			{asChild
				? !isValidElement(children)
					? children
					: cloneElement(children, {
							...mergeReactProps(rest, children.props),
							// @ts-expect-error: children prop is not typed
							children: getChildWithLoader(children.props.children),
						})
				: getChildWithLoader(children)}
		</ark.button>
	);
}
