import type { JSONContent } from "@tiptap/core";
import { createStore } from "solid-js/store";
import type { DbProject } from "~/lib/db/schema";
import type { Theme } from "~/lib/templates/theme";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { RichTextEditor } from "./rich-text-editor";
import { Sidebar } from "./sidebar";

type EditorProps = {
	project: DbProject;
	template?: {
		subject: string;
		contents: JSONContent;
		theme: Theme;
	};
};

export function Editor(props: EditorProps) {
	return (
		<div class="flex grow">
			<EditorContents
				theme={props.template?.theme || props.project.defaultTheme}
				defaultContents={props.template?.contents}
				defaultSubject={props.template?.subject}
				project={props.project}
			/>
		</div>
	);
}

type EditorContentsProps = {
	theme: Theme;
	defaultSubject?: string;
	defaultContents?: JSONContent;
	project: DbProject;
};

function EditorContents(props: EditorContentsProps) {
	const [theme, setTheme] = createStore(props.theme);

	return (
		<>
			<GridBgContainer class="h-full w-full grow flex-row items-stretch bg-grid-black/10">
				<RichTextEditor
					theme={theme}
					projectId={props.project.id}
					defaultContents={props.defaultContents}
					defaultSubject={props.defaultSubject}
				/>
			</GridBgContainer>
			<Sidebar theme={theme} onUpdate={setTheme} />
		</>
	);
}

export function EditorSkeleton() {
	return (
		<GridBgContainer class="h-full w-full grow flex gap-4 flex-col justify-center items-center bg-grid-black/10 p-16">
			<div class="animate-pulse bg-gray-300 max-w-5xl grow rounded-xl w-full" />
			<div class="w-32 h-6 rounded-full animate-pulse bg-gray-300" />
		</GridBgContainer>
	);
}
