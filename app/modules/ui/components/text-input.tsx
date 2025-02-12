import { Field, type FieldInputProps } from "@ark-ui/react";
import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const styles = tv({
	base: "w-full rounded-md border text-input text-sm outline-none ring-primary-600 focus-visible:ring-[1px] aria-[invalid=true]:border-red-500 dark:border-gray-700 dark:bg-gray-800",
	variants: {
		padding: {
			sm: "px-2 py-1",
			md: "px-2.5 py-1.5",
			lg: "px-3 py-2",
		},
	},
	defaultVariants: {
		padding: "md",
	},
});

type TextInputProps = VariantProps<typeof styles> & FieldInputProps;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	function TextInput(props, ref) {
		const { className, padding, ...rest } = props;

		return (
			<Field.Input
				{...rest}
				ref={ref}
				className={styles({ padding, class: className })}
			/>
		);
	},
);
