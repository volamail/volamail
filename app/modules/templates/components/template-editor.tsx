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
		<div className="flex grow min-h-0">
			<Sidebar />
			<GridBgContainer
				className="flex flex-col justify-center items-center grow p-8"
				classes={{
					background: "dark:bg-gray-800",
				}}
			>
				<div className="z-0 shadow-2xl flex flex-col overflow-hidden grow w-full rounded-2xl border dark:border-gray-700">
					<div className="p-4 border-b dark:border-gray-700 dark:bg-gray-800 inline-flex items-center">
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
