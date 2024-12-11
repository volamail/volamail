import type { JSONContent } from "@tiptap/core";
import { type ISimpleType, type Instance, clone, types } from "mobx-state-tree";
import { createContext, useContext, useState } from "react";
import { getDummyTemplateTranslationForLanguage } from "./defaults";
import { TEMPLATE_LANGUAGES, type TemplateLanguage } from "./languages";
import type { Theme as ThemeType } from "./theme";

type Translation = {
	subject: string;
	contents: JSONContent;
	language: TemplateLanguage;
};

const TemplateTranslation = types
	.model({
		language: types.identifier as ISimpleType<TemplateLanguage>,
		subject: types.string,
		contents: types.frozen<JSONContent>(),
	})
	.actions((self) => ({
		setSubject(subject: string) {
			self.subject = subject;
		},
		setContents(contents: JSONContent) {
			self.contents = contents;
		},
	}));

const Template = types
	.model({
		translations: types.map(TemplateTranslation),
		defaultTranslation: TemplateTranslation,
		currentLanguage: types.enumeration("TemplateLanguage", TEMPLATE_LANGUAGES),
	})
	.actions((self) => ({
		addTranslation(language: TemplateLanguage) {
			self.translations.set(
				language,
				getDummyTemplateTranslationForLanguage(language),
			);

			self.currentLanguage = language;
		},
		removeTranslation(language: TemplateLanguage) {
			if (language === self.defaultTranslation.language) {
				return;
			}

			if (language === self.currentLanguage) {
				self.currentLanguage = self.defaultTranslation.language;
			}

			self.translations.delete(language);
		},
		changeCurrentLanguage(language: TemplateLanguage) {
			self.currentLanguage = language;
		},
		setDefaultTranslation(language: TemplateLanguage) {
			// biome-ignore lint/style/noNonNullAssertion: should be ok?
			const translation = clone(self.translations.get(language)!);

			const prevDefault = clone(self.defaultTranslation);

			self.translations.set(prevDefault.language, prevDefault);

			self.translations.delete(language);

			self.defaultTranslation = translation;

			self.currentLanguage = language;
		},
	}))
	.views((self) => ({
		get sortedTranslations() {
			return [self.defaultTranslation, ...self.translations.values()];
		},
		get currentTranslation() {
			return (
				self.translations.get(self.currentLanguage) || self.defaultTranslation
			);
		},
		get availableLanguages() {
			return TEMPLATE_LANGUAGES.filter(
				(language) =>
					self.defaultTranslation.language !== language &&
					!self.translations.has(language),
			);
		},
	}));

const Theme = types
	.model({
		background: types.string,
		contentBackground: types.string,
		contentMaxWidth: types.number,
		contentBorderRadius: types.number,
	})
	.actions((self) => ({
		setBackground(value: string) {
			self.background = value;
		},
		setContentBackground(value: string) {
			self.contentBackground = value;
		},
		setContentMaxWidth(value: number) {
			self.contentMaxWidth = value;
		},
		setContentBorderRadius(value: number) {
			self.contentBorderRadius = value;
		},
	}));

const Editor = types.model({
	theme: Theme,
	template: Template,
});

type EditorInstance = Instance<typeof Editor>;

const EditorStoreContext = createContext<EditorInstance | null>(null);

interface EditorStoreProviderProps {
	children: React.ReactNode;
	theme: ThemeType;
	template?: {
		defaultTranslation: Translation;
		translations: Partial<Record<TemplateLanguage, Translation>>;
	};
	defaultLanguage: TemplateLanguage;
}

export function EditorStoreProvider(props: EditorStoreProviderProps) {
	const [store] = useState(() =>
		Editor.create({
			theme: props.theme,
			template: {
				currentLanguage: props.defaultLanguage,
				defaultTranslation:
					props.template?.defaultTranslation ||
					getDummyTemplateTranslationForLanguage(props.defaultLanguage),
				translations: props.template?.translations || {},
			},
		}),
	);

	return (
		<EditorStoreContext.Provider value={store}>
			{props.children}
		</EditorStoreContext.Provider>
	);
}

export function useEditorStore() {
	const store = useContext(EditorStoreContext);

	if (store === null) {
		throw new Error("useEditorStore must be used within a EditorStoreProvider");
	}

	return store;
}
