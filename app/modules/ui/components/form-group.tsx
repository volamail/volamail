import { Field } from "@ark-ui/react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";
import { Label } from "./label";

const styles = tv({
	slots: {
		container: "flex flex-col gap-1",
		hint: "text-gray-600 text-xs dark:text-gray-400",
		error: "text-red-500 text-xs dark:text-red-400",
	},
});

interface Props {
	label?: string;
	name?: string;
	hint?: ReactNode;
	error?: ReactNode;
	children: ReactNode;
	classes?: {
		container?: string;
		hint?: string;
		error?: string;
		label?: string;
	};
}

export function FormGroup(props: Props) {
	return (
		<Field.Root
			className={styles().container({ class: props.classes?.container })}
			invalid={!!props.error}
		>
			{props.label && (
				<Field.Label asChild>
					<Label className={props.classes?.label}>{props.label}</Label>
				</Field.Label>
			)}

			{props.children}

			{props.error && (
				<Field.ErrorText
					className={styles().error({ class: props.classes?.error })}
				>
					{props.error}
				</Field.ErrorText>
			)}

			{props.hint && (
				<Field.HelperText
					className={styles().hint({ class: props.classes?.hint })}
				>
					{props.hint}
				</Field.HelperText>
			)}
		</Field.Root>
	);
}
