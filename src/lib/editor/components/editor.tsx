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
			/>
		</div>
	);
}

type EditorContentsProps = {
	theme: Theme;
	defaultSubject?: string;
	defaultContents?: JSONContent;
};

function EditorContents(props: EditorContentsProps) {
	const [theme, setTheme] = createStore(props.theme);

	return (
		<>
			<GridBgContainer class="h-full w-full flex-row items-stretch">
				<RichTextEditor
					theme={theme}
					defaultContents={props.defaultContents}
					defaultSubject={props.defaultSubject}
				/>
			</GridBgContainer>
			<Sidebar theme={theme} onUpdate={setTheme} />
		</>
	);
}
