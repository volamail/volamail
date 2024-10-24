import { FileIcon, TextSelectIcon } from "lucide-solid";
import type { Theme } from "~/lib/templates/theme";
import { ColorInput } from "~/lib/ui/components/color-input";
import { NumberInput } from "~/lib/ui/components/number-input";
import { CssSizeInput } from "./css-size-input";

type ThemeTabProps = {
	theme: Theme;
	onUpdate: (theme: Partial<Theme>) => void;
};

export function ThemeTab(props: ThemeTabProps) {
	return (
		<div class="flex flex-col gap-6 py-4">
			<section class="flex flex-col">
				<div class="flex items-center gap-2">
					<hr class="border-gray-200 w-2" />
					<h3 class="font-semibold text-gray-400 text-xs inline-flex items-center gap-2">
						Page
						<FileIcon class="size-4" />
					</h3>
					<hr class="border-gray-200 grow" />
				</div>

				<div class="flex flex-col px-4 py-3">
					<ColorInput
						name="theme.background"
						label="Background"
						onChange={(value) => props.onUpdate({ background: value })}
						defaultColor={props.theme.background}
					/>
				</div>
			</section>
			<section class="flex flex-col">
				<div class="flex items-center gap-2">
					<hr class="border-gray-200 w-2" />
					<h3 class="font-semibold text-gray-400 text-xs inline-flex items-center gap-2">
						Content
						<TextSelectIcon class="size-4" />
					</h3>
					<hr class="border-gray-200 grow" />
				</div>
				<div class="flex flex-col px-4 py-3 gap-4">
					<ColorInput
						name="theme.contentBackground"
						label="Background"
						onChange={(value) => props.onUpdate({ contentBackground: value })}
						defaultColor={props.theme.contentBackground}
					/>

					<CssSizeInput
						name="theme.contentMaxWidth"
						label="Max width"
						onBlur={(event) =>
							props.onUpdate({ contentMaxWidth: event.target.value })
						}
						hint="Use px or em"
						value={props.theme.contentMaxWidth}
					/>

					<NumberInput
						name="theme.contentBorderRadius"
						label="Border radius"
						min={0}
						onValueChange={({ valueAsNumber }) =>
							props.onUpdate({ contentBorderRadius: valueAsNumber })
						}
						value={
							props.theme.contentBorderRadius
								? String(props.theme.contentBorderRadius)
								: "0"
						}
					/>
				</div>
			</section>
		</div>
	);
}
