import { Field, type FieldInputProps } from "@ark-ui/react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";

const styles = tv({
	base: "w-full rounded-md border px-2.5 py-1.5 text-input text-sm outline-none ring-primary-600 focus-visible:ring-[1px] aria-[invalid=true]:border-red-500 dark:border-gray-700 dark:bg-gray-800",
});

export const TextInput = forwardRef<HTMLInputElement, FieldInputProps>(
	function TextInput(props, ref) {
		const { className, ...rest } = props;

		return (
			<Field.Input
				{...rest}
				ref={ref}
				className={styles({ class: className })}
			/>
		);
	},
);
