import { Maskito, maskitoUpdateElement } from "@maskito/core";
import { maskitoEventHandler } from "@maskito/kit";
import type { ComponentProps } from "solid-js";
import { TextInput } from "~/lib/ui/components/text-input";

type Props = ComponentProps<typeof TextInput>;

export function CssSizeInput(props: Props) {
	function handleRef(element: HTMLInputElement) {
		new Maskito(element, {
			mask: /^\d+(p|px|e|em)?$/,
			plugins: [
				maskitoEventHandler("blur", (element) => {
					if (!element.value.endsWith("px") && !element.value.endsWith("em")) {
						const numericValue = element.value.replace(/\D/g, "");

						if (element.value.endsWith("e")) {
							return maskitoUpdateElement(element, `${numericValue}em`);
						}

						maskitoUpdateElement(element, `${numericValue}px`);
					}
				}),
			],
		});
	}

	return <TextInput ref={handleRef} {...props} />;
}
