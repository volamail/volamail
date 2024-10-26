import { useSearchParams } from "@solidjs/router";
import type { JSONContent } from "@tiptap/core";
import { createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import type { DbProject } from "~/lib/db/schema";
import type { TemplateLanguage } from "~/lib/templates/languages";
import type { Theme } from "~/lib/templates/theme";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { RichTextEditor } from "./rich-text-editor";
import { Sidebar } from "./sidebar";

type EditorProps = {
	project: DbProject;
	template?: {
		theme: Theme;
		translations: Array<{
			subject: string;
			contents: JSONContent;
			language: TemplateLanguage;
		}>;
	};
};

export function Editor(props: EditorProps) {
	const [searchParams] = useSearchParams();

	const isEditing = createMemo(() => !!props.template);

	const translation = createMemo(() => {
		if (!props.template) {
			return;
		}

		return props.template?.translations.find(
			(t) =>
				t.language ===
				(searchParams.lang || props.project.defaultTemplateLanguage),
		);
	});

	const [theme, setTheme] = createStore(
		props.template?.theme || props.project.defaultTheme,
	);

	const languages = createMemo(() => {
		if (!props.template) {
			return [props.project.defaultTemplateLanguage];
		}

		return props.template.translations.map((t) => t.language);
	});

	return (
		<div class="flex grow">
			<input
				type="hidden"
				name="language"
				value={searchParams.lang || props.project.defaultTemplateLanguage}
			/>

			<GridBgContainer class="h-full w-full grow flex-row items-stretch bg-grid-black/10">
				<RichTextEditor
					theme={theme}
					projectId={props.project.id}
					defaultSubject={translation()?.subject}
					defaultContents={translation()?.contents}
				/>
			</GridBgContainer>
			<Sidebar
				isEditing={isEditing()}
				theme={{ theme, onUpdate: setTheme }}
				i18n={{
					defaultLanguage: props.project.defaultTemplateLanguage,
					languages: languages(),
				}}
			/>
		</div>
	);
}

export function EditorSkeleton() {
	return (
		<GridBgContainer class="h-full w-full grow flex gap-4 flex-col justify-center items-center bg-grid-black/10 p-16">
			<div class="animate-pulse bg-gray-100 max-w-5xl grow rounded-xl w-full" />
			<div class="w-32 h-6 rounded-full animate-pulse bg-gray-100" />
		</GridBgContainer>
	);
}
