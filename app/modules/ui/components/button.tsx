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

export const buttonStyles = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-md text-center font-medium text-sm outline-none ring-primary-600 transition-colors focus-visible:ring-[1px] disabled:opacity-50",
	variants: {
		padding: {
			sm: "px-2 py-1",
			md: "px-2.5 py-1",
			lg: "px-3 py-2",
		},
		color: {
			primary: "",
			neutral: "",
			red: "",
		},
		variant: {
			solid: "",
			outline: "",
			ghost: "",
		},
		loading: {
			true: "opacity-50",
			false: "",
		},
	},
	compoundVariants: [
		{
			color: "primary",
			variant: "solid",
			className:
				"border bg-primary-600 text-white dark:border-primary-700 dark:bg-primary-900 [&:hover:not(:disabled)]:bg-primary-500 dark:[&:hover:not(:disabled)]:bg-primary-700",
		},
		{
			color: "primary",
			variant: "outline",
			className:
				"border border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 [&:hover:not(:disabled)]:bg-primary-50",
		},
		{
			color: "primary",
			variant: "ghost",
			className:
				"text-primary-600 dark:text-primary-400 [&:hover:not(:disabled)]:bg-primary-50 [&:hover:not(:disabled)]:dark:bg-primary-900",
		},
		{
			color: "neutral",
			variant: "solid",
			className:
				"border bg-gray-600 text-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 [&:hover:not(:disabled)]:bg-gray-500 dark:[&:hover:not(:disabled)]:bg-gray-700",
		},
		{
			color: "neutral",
			variant: "outline",
			className:
				"border border-gray-600 text-gray-600 dark:border-gray-400 dark:text-gray-400 [&:hover:not(:disabled)]:bg-gray-50",
		},
		{
			color: "neutral",
			variant: "ghost",
			className:
				"text-gray-600 dark:text-gray-400 [&:hover:not(:disabled)]:bg-gray-50 dark:[&:hover:not(:disabled)]:bg-gray-800",
		},
		{
			color: "red",
			variant: "solid",
			className:
				"border bg-red-600 text-white dark:border-red-600 dark:bg-red-800 dark:text-red-50 [&:hover:not(:disabled)]:bg-red-500 dark:[&:hover:not(:disabled)]:bg-red-700",
		},
		{
			color: "red",
			variant: "outline",
			className:
				"border border-red-600 text-red-600 dark:border-red-400 dark:text-red-400 [&:hover:not(:disabled)]:bg-red-50",
		},
		{
			color: "red",
			variant: "ghost",
			className:
				"text-red-600 dark:text-red-400 [&:hover:not(:disabled)]:bg-red-50 dark:[&:hover:not(:disabled)]:bg-red-900",
		},
	],
	defaultVariants: {
		color: "primary",
		variant: "solid",
		padding: "md",
	},
});

type ButtonProps = VariantProps<typeof buttonStyles> &
	ComponentProps<typeof ark.button> & {
		leading?: ReactNode;
		trailing?: ReactNode;
	};

export function Button(props: ButtonProps) {
	const { className, leading, trailing, children, loading, asChild, ...rest } =
		props;

	const leadingContent = leading || null;
	const trailingContent = loading ? (
		<LoaderIcon className="size-4 animate-spin" />
	) : (
		trailing || null
	);

	return (
		<ark.button
			className={buttonStyles({ ...props, loading, className })}
			asChild={asChild}
			{...rest}
		>
			{asChild ? (
				!isValidElement(children) ? (
					children
				) : (
					cloneElement(children, {
						...mergeReactProps(rest, children.props),
						// @ts-expect-error: children prop is not typed
						children: (
							<>
								{leadingContent}
								{children.props.children}
								{trailingContent}
							</>
						),
					})
				)
			) : (
				<>
					{leadingContent}
					{children}
					{trailingContent}
				</>
			)}
		</ark.button>
	);
}
