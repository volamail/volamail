import { Label } from "@/modules/ui/components/label";
import { TextInput } from "@/modules/ui/components/text-input";
import { observer } from "mobx-react-lite";

import { GridBgContainer } from "@/modules/ui/components/grid-bg-container";
import { useEditorStore } from "../store";
import { RichTextEditor } from "./rich-text-editor";
import { Sidebar } from "./sidebar";

export const TemplateEditor = observer(() => {
	const store = useEditorStore();

	return (
		<div className="flex min-h-0 grow">
			<Sidebar />
			<GridBgContainer
				className="flex grow flex-col items-center justify-center p-8"
				classes={{
					background: "dark:bg-gray-800",
				}}
			>
				<div className="z-0 flex w-full grow flex-col overflow-hidden rounded-2xl border shadow-2xl dark:border-gray-700">
					<div className="inline-flex items-center border-b p-4 dark:border-gray-700 dark:bg-gray-800">
						<Label htmlFor="subject">Subject:</Label>
						<TextInput
							className="border-none focus-visible:ring-0"
							key={store.template.currentTranslation.language}
							id="subject"
							defaultValue={store.template.currentTranslation.subject}
							onChange={(e) =>
								store.template.currentTranslation.setSubject(e.target.value)
							}
							placeholder="Welcome to Volamail"
						/>
					</div>
					<RichTextEditor />
				</div>
			</GridBgContainer>
		</div>
	);
});
