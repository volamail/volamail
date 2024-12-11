import { Field, type FieldInputProps } from "@ark-ui/react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";

const styles = tv({
	base: "py-1.5 text-input focus-visible:ring-[1px] ring-primary-600 outline-none text-sm w-full rounded-md px-2.5 border dark:border-gray-700 dark:bg-gray-800 aria-[invalid=true]:border-red-500",
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
