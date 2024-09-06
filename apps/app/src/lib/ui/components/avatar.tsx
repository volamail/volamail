import * as ImagePrimitive from "@kobalte/core/image";
import { type ValidComponent, splitProps } from "solid-js";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";

import { cn } from "~/lib/ui/utils/cn";

type AvatarProps<T extends ValidComponent = "span"> = PolymorphicProps<T> & {
	class?: string;
	src?: string | null;
	fallback: string;
};

export function Avatar(props: AvatarProps) {
	const [local, others] = splitProps(props, ["class", "src", "fallback"]);

	return (
		<ImagePrimitive.Root
			class={cn(
				"relative flex size-6 shrink-0 overflow-hidden rounded-full",
				local.class,
			)}
			{...others}
		>
			<ImagePrimitive.Img
				class="aspect-square size-full"
				src={local.src || undefined}
			/>

			<ImagePrimitive.Fallback class="flex size-full items-center justify-center rounded-full bg-gray-200">
				{local.fallback}
			</ImagePrimitive.Fallback>
		</ImagePrimitive.Root>
	);
}
