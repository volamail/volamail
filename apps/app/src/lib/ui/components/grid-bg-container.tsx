// @refresh reload
import { twMerge } from "tailwind-merge";
import { splitProps, type ComponentProps } from "solid-js";
import { cn } from "~/lib/ui/utils/cn";

type Props = ComponentProps<"div"> & {
	classes?: {
		container?: string;
		background?: string;
	};
};

export function GridBgContainer(props: Props) {
	const [local, rest] = splitProps(props, ["class", "classes", "children"]);

	return (
		<div
			class={twMerge(
				"flex flex-col justify-center items-center bg-grid-black/5 relative",
				local.class,
				local.classes?.container,
			)}
			{...rest}
		>
			<div
				class={cn(
					"absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white)]",
					local.classes?.background,
				)}
			/>
			{local.children}
		</div>
	);
}
