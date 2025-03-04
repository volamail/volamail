import { FormGroup } from "@/modules/ui/components/form-group";
import { Select } from "@/modules/ui/components/select";
import { FileIcon, TextSelectIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ComponentType, ReactNode } from "react";
import { useEditorStore } from "../store";
import {
	CONTENT_BORDER_RADIUS_OPTIONS,
	CONTENT_BORDER_WIDTH_OPTIONS,
	CONTENT_MAX_WIDTH_OPTIONS,
} from "../theme";
import { ColorInput } from "./color-input";

export const ThemeTab = observer(function ThemeTab() {
	const store = useEditorStore();

	return (
		<div className="flex flex-col gap-8">
			<ThemeTabSection title="Page" icon={FileIcon}>
				<ColorInput
					label="Background"
					classes={{
						container: "justify-between",
						control: "w-28",
						label: "text-xs dark:text-gray-400",
						input: "text-xs",
					}}
					defaultValue={store.theme.background}
					onChange={store.theme.setBackground}
				/>
			</ThemeTabSection>

			<ThemeTabSection title="Content" icon={TextSelectIcon}>
				<FormGroup
					label="Width"
					classes={{
						container: "flex-row justify-between items-center gap-2",
						label: "text-xs dark:text-gray-400",
					}}
				>
					<Select
						defaultValue={[store.theme.contentMaxWidth.toString()]}
						items={CONTENT_MAX_WIDTH_OPTIONS.map((option) => ({
							label: option.toString(),
							value: option.toString(),
						}))}
						onChange={(values) => {
							store.theme.setContentMaxWidth(Number(values[0]));
						}}
						classes={{
							container: "w-28",
							trigger: "text-xs",
							item: "text-xs",
						}}
					/>
				</FormGroup>

				<FormGroup
					label="Border radius"
					classes={{
						container: "flex-row justify-between items-center gap-2",
						label: "text-xs dark:text-gray-400",
					}}
				>
					<Select
						defaultValue={[store.theme.contentBorderRadius.toString()]}
						items={CONTENT_BORDER_RADIUS_OPTIONS.map((option) => ({
							label: option.toString(),
							value: option.toString(),
						}))}
						onChange={(values) => {
							store.theme.setContentBorderRadius(Number(values[0]));
						}}
						classes={{
							container: "w-28",
							trigger: "text-xs",
							item: "text-xs",
						}}
					/>
				</FormGroup>

				<ColorInput
					label="Border color"
					classes={{
						container: "justify-between",
						control: "w-28",
						label: "text-xs dark:text-gray-400 shrink-0",
						input: "text-xs",
					}}
					defaultValue={store.theme.contentBorderColor}
					onChange={store.theme.setContentBorderColor}
				/>

				<FormGroup
					label="Border width"
					classes={{
						container: "flex-row justify-between items-center gap-2",
						label: "text-xs dark:text-gray-400",
					}}
				>
					<Select
						defaultValue={[store.theme.contentBorderWidth.toString()]}
						items={CONTENT_BORDER_WIDTH_OPTIONS.map((option) => ({
							label: option.toString(),
							value: option.toString(),
						}))}
						onChange={(values) => {
							store.theme.setContentBorderWidth(Number(values[0]));
						}}
						classes={{
							container: "w-28",
							trigger: "text-xs",
							item: "text-xs",
						}}
					/>
				</FormGroup>
			</ThemeTabSection>
		</div>
	);
});

interface ThemeTabSectionProps {
	title: string;
	icon: ComponentType<{ className?: string }>;
	children: ReactNode | ReactNode[];
}

function ThemeTabSection(props: ThemeTabSectionProps) {
	const { icon: Icon, title, children } = props;

	return (
		<section className="flex flex-col gap-2">
			<h3 className="mb-1 inline-flex items-center gap-1.5 font-medium text-xs dark:text-gray-50">
				{title}
				<Icon className="size-4" />
			</h3>
			{children}
		</section>
	);
}
