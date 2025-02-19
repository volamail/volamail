import { Portal } from "@ark-ui/react";
import { type ReactNode, useRef } from "react";
import { tv } from "tailwind-variants";

const styles = tv({
	base: "flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-center text-sm dark:border-gray-700 dark:bg-gradient-to-r dark:from-gray-950 dark:to-primary-950/50",
});

interface Props {
	children: ReactNode;
	className?: string;
}

export function StickyBanner({ children, className }: Props) {
	const container = useRef(document.getElementById("banner-container"));

	return (
		<Portal container={container}>
			<div className={styles({ class: className })}>{children}</div>
		</Portal>
	);
}
