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
	base: "inline-flex transition-colors outline-none focus-visible:ring-[1px] ring-primary-600 rounded-md items-center gap-2 text-sm justify-center text-center font-medium disabled:opacity-50",
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
				"bg-primary-600 text-white [&:hover:not(:disabled)]:bg-primary-500 dark:bg-primary-900 border dark:border-primary-700 dark:[&:hover:not(:disabled)]:bg-primary-700",
		},
		{
			color: "primary",
			variant: "outline",
			className:
				"border border-primary-600 text-primary-600 [&:hover:not(:disabled)]:bg-primary-50 dark:border-primary-400 dark:text-primary-400",
		},
		{
			color: "primary",
			variant: "ghost",
			className:
				"text-primary-600 [&:hover:not(:disabled)]:bg-primary-50 dark:text-primary-400 ",
		},
		{
			color: "neutral",
			variant: "solid",
			className:
				"bg-gray-600 text-white [&:hover:not(:disabled)]:bg-gray-500 dark:bg-gray-800 dark:text-gray-50 border dark:border-gray-600 dark:[&:hover:not(:disabled)]:bg-gray-700",
		},
		{
			color: "neutral",
			variant: "outline",
			className:
				"border border-gray-600 text-gray-600 [&:hover:not(:disabled)]:bg-gray-50 dark:border-gray-400 dark:text-gray-400",
		},
		{
			color: "neutral",
			variant: "ghost",
			className:
				"text-gray-600 [&:hover:not(:disabled)]:bg-gray-50 dark:text-gray-400 dark:[&:hover:not(:disabled)]:bg-gray-800",
		},
		{
			color: "red",
			variant: "solid",
			className:
				"bg-red-600 text-white [&:hover:not(:disabled)]:bg-red-500 dark:bg-red-800 dark:text-red-50 border dark:border-red-600 dark:[&:hover:not(:disabled)]:bg-red-700",
		},
		{
			color: "red",
			variant: "outline",
			className:
				"border border-red-600 text-red-600 [&:hover:not(:disabled)]:bg-red-50 dark:border-red-400 dark:text-red-400",
		},
		{
			color: "red",
			variant: "ghost",
			className:
				"text-red-600 [&:hover:not(:disabled)]:bg-red-50 dark:text-red-400 dark:[&:hover:not(:disabled)]:bg-red-900",
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
