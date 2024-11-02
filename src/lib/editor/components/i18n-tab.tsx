import { Select, createListCollection } from "@ark-ui/solid";
import { A, useSearchParams } from "@solidjs/router";
import { ChevronDownIcon, XIcon } from "lucide-solid";
import { For, Index, Show, createMemo } from "solid-js";
import { Portal } from "solid-js/web";
import {
	TEMPLATE_LANGUAGES,
	TEMPLATE_LANGUAGES_MAP,
	type TemplateLanguage,
} from "~/lib/templates/languages";
import { Button } from "~/lib/ui/components/button";
import { cn } from "~/lib/ui/utils/cn";
import { DeleteTemplateTranlationDialog } from "./delete-template-translation-dialog";

interface I18nTabProps {
	projectId: string;
	templateSlug?: string;
	isEditing: boolean;
	defaultLanguage: TemplateLanguage;
	templateLanguages: Array<TemplateLanguage>;
}

export function I18nTab(props: I18nTabProps) {
	const [searchParams, setSearchParams] = useSearchParams();

	const templateLanguages = createMemo(() => {
		if (!searchParams.lang) {
			return props.templateLanguages.map((t) => ({ lang: t, temp: false }));
		}

		let foundTemporaryLang = false;

		const langs: Array<{ lang: TemplateLanguage; temp: boolean }> = [];

		for (const lang of props.templateLanguages) {
			langs.push({
				lang,
				temp: false,
			});

			if (lang === searchParams.lang) {
				foundTemporaryLang = true;
			}
		}

		if (!foundTemporaryLang) {
			langs.push({
				lang: searchParams.lang as TemplateLanguage,
				temp: true,
			});
		}

		return langs;
	});

	const availableLanguages = createMemo(() => {
		return TEMPLATE_LANGUAGES.filter(
			(lang) => !templateLanguages().find((t) => t.lang === lang),
		);
	});

	const collection = createMemo(() =>
		createListCollection({
			items: availableLanguages().map((lang) => ({
				label: TEMPLATE_LANGUAGES_MAP[lang].label,
				value: lang,
			})),
		}),
	);

	return (
		<div class="flex flex-col relative h-full">
			<ul class="self-stretch">
				<For each={templateLanguages()}>
					{(language) => (
						<LanguageListItem
							default={language.lang === props.defaultLanguage}
							projectId={props.projectId}
							slug={props.templateSlug}
							language={language.lang}
							active={
								language.lang === searchParams.lang ||
								(!searchParams.lang && language.lang === props.defaultLanguage)
							}
							temp={language.temp}
						/>
					)}
				</For>
			</ul>

			<Show
				when={props.isEditing}
				fallback={
					<div class="grow flex flex-col gap-2 text-gray-500 text-sm text-center justify-center items-center">
						Save the email to add translations in other languages.
					</div>
				}
			>
				<Show when={availableLanguages().length > 0}>
					<Select.Root
						collection={collection()}
						value={[]}
						unmountOnExit
						lazyMount
						onValueChange={({ value }) =>
							setSearchParams({
								...searchParams,
								lang: value,
							})
						}
						class="p-4 self-stretch"
					>
						<Select.Control>
							<Select.Trigger class="w-full rounded-lg bg-white hover:bg-gray-100 transition-colors py-1 px-2 border border-gray-300 inline-flex gap-2 items-center text-sm text-gray-600">
								<span class="grow text-left">Add translation...</span>
								<Select.Indicator>
									<ChevronDownIcon class="size-4" />
								</Select.Indicator>
							</Select.Trigger>
							<Portal>
								<Select.Positioner>
									<Select.Content class=" border border-gray-300 bg-white z-50 rounded-lg text-sm overflow-hidden">
										<Index each={collection().items}>
											{(item) => (
												<Select.Item
													item={item()}
													class="flex cursor-default items-center gap-2 px-2.5 data-[highlighted]:bg-gray-200 transition-colors py-2 w-[var(--reference-width)]"
												>
													<img
														alt={TEMPLATE_LANGUAGES_MAP[item().value].label}
														src={getLanguageFlagUrl(item().value)}
														class="size-4 rounded-full"
													/>
													<Select.ItemText class="grow">
														{item().label}
													</Select.ItemText>
													<Select.ItemIndicator>✓</Select.ItemIndicator>
												</Select.Item>
											)}
										</Index>
									</Select.Content>
								</Select.Positioner>
							</Portal>
						</Select.Control>
					</Select.Root>
				</Show>
			</Show>
		</div>
	);
}

interface LanguageListItemProps {
	projectId: string;
	slug?: string;
	language: TemplateLanguage;
	active: boolean;
	temp?: boolean;
	default?: boolean;
}

function LanguageListItem(props: LanguageListItemProps) {
	return (
		<li>
			<A
				href={`?lang=${props.language}`}
				class={cn(
					"relative flex cursor-default gap-3 items-center px-4 py-3 bg-white border-b border-gray-200 transition-colors",
					props.active
						? "text-black font-medium"
						: "text-gray-400 hover:bg-gray-100",
				)}
			>
				<Show when={props.active}>
					<div class="absolute left-0 h-8 top-1/2 -translate-y-1/2 bg-black w-1 rounded-r-full" />
				</Show>
				<img
					alt={TEMPLATE_LANGUAGES_MAP[props.language].label}
					src={getLanguageFlagUrl(props.language)}
					class="size-6 rounded-full"
				/>
				<span class="text-sm grow">
					{TEMPLATE_LANGUAGES_MAP[props.language].label}{" "}
					<span class="text-gray-400 text-xs font-normal">
						{props.language}
					</span>
				</span>
				<Show when={props.active && !props.default}>
					<Show
						when={!props.temp && props.slug}
						fallback={
							<Button as={A} href="." variant="ghost" even class="p-0.5">
								<XIcon class="size-4" />
								<span class="sr-only">Delete translation</span>
							</Button>
						}
					>
						<DeleteTemplateTranlationDialog
							projectId={props.projectId}
							language={props.language}
							slug={props.slug!}
						/>
					</Show>
				</Show>
			</A>
		</li>
	);
}

function getLanguageFlagUrl(language: TemplateLanguage) {
	return `https://hatscripts.github.io/circle-flags/flags/${TEMPLATE_LANGUAGES_MAP[language].flagCode}.svg`;
}
