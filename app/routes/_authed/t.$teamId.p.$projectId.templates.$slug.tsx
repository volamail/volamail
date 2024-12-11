import { DeleteTemplateDialog } from "@/modules/templates/components/delete-template-dialog";
import { TemplateEditor } from "@/modules/templates/components/template-editor";
import {
	sendTemplateTestFn,
	updateTemplateFn,
} from "@/modules/templates/mutations";
import { templateQueryOptions } from "@/modules/templates/queries";
import { renderTemplateToHtml } from "@/modules/templates/render";
import { EditorStoreProvider, useEditorStore } from "@/modules/templates/store";
import { ActionButton } from "@/modules/ui/components/action-button";
import { Button } from "@/modules/ui/components/button";
import { useImperativeDialog } from "@/modules/ui/components/dialog";
import { Menu, MenuItem } from "@/modules/ui/components/menu";
import type { MenuSelectionDetails } from "@ark-ui/react";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	CircleCheckBigIcon,
	Code2Icon,
	EllipsisVerticalIcon,
	FolderPenIcon,
	SendIcon,
	XIcon,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute(
	"/_authed/t/$teamId/p/$projectId/templates/$slug",
)({
	component: RouteComponent,
	async loader({ context, params }) {
		await context.queryClient.ensureQueryData(
			templateQueryOptions(params.teamId, params.projectId, params.slug),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();

	const { data: template } = useSuspenseQuery(
		templateQueryOptions(params.teamId, params.projectId, params.slug),
	);

	return (
		<div className="flex flex-col h-dvh">
			<EditorStoreProvider
				defaultLanguage={template.defaultTranslation.language}
				theme={template.theme}
				template={template}
			>
				<div className="p-3 flex justify-between items-center border-b dark:border-gray-800">
					<div className="flex flex-col">
						<h3 className="font-medium">{template.slug}</h3>
						<p className="text-gray-500 text-sm">
							Last update:{" "}
							{new Date(template.modifiedAt).toLocaleString("en-US", {
								year: "numeric",
								month: "short",
								day: "numeric",
								hour: "numeric",
								minute: "numeric",
							})}
						</p>
					</div>
					<EditTemplateActions />
				</div>

				<TemplateEditor />
			</EditorStoreProvider>
		</div>
	);
}

function EditTemplateActions() {
	const params = Route.useParams();

	const store = useEditorStore();

	const queryClient = useQueryClient();

	const deleteDialog = useImperativeDialog<{
		teamId: string;
		projectId: string;
		slug: string;
	}>();

	const updateTemplateMutation = useMutation({
		mutationFn: updateTemplateFn,
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: templateQueryOptions(
					params.teamId,
					params.projectId,
					params.slug,
				).queryKey,
			});
		},
	});

	const sendTestMutation = useMutation({
		mutationFn: sendTemplateTestFn,
	});

	function handleSaveChanges() {
		return updateTemplateMutation.mutateAsync({
			data: {
				teamId: params.teamId,
				projectId: params.projectId,
				theme: store.theme,
				template: {
					slug: params.slug,
					defaultTranslation: store.template.defaultTranslation,
					translations: store.template.translations.toJSON(),
				},
			},
		});
	}

	function handleSendTest() {
		toast.promise(
			() =>
				sendTestMutation.mutateAsync({
					data: {
						teamId: params.teamId,
						projectId: params.projectId,
						theme: store.theme,
						template: {
							subject: store.template.currentTranslation.subject,
							contents: store.template.currentTranslation.contents,
						},
					},
				}),
			{
				loading: "Sending test...",
				success: "Test sent successfully",
				error: "Failed to send test",
			},
		);
	}

	function handleMenuSelect(details: MenuSelectionDetails) {
		if (details.value === "delete") {
			return deleteDialog.open({
				teamId: params.teamId,
				projectId: params.projectId,
				slug: params.slug,
			});
		}

		if (details.value === "export") {
			const contents = renderTemplateToHtml({
				contents: store.template.currentTranslation.contents,
				theme: store.theme,
			});

			const blob = new Blob([contents], { type: "text/html" });

			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");

			a.href = url;
			a.download = `${params.slug}.html`;
			a.click();

			toast.success("HTML exported successfully");
		}
	}

	return (
		<div className="flex gap-4 items-center">
			<Menu
				placement="bottom-end"
				trigger={
					<ActionButton
						variant="ghost"
						color="neutral"
						padding="sm"
						aria-label="More actions"
					>
						<EllipsisVerticalIcon className="size-4" />
					</ActionButton>
				}
				onSelect={handleMenuSelect}
			>
				<MenuItem value="export">
					<Code2Icon className="size-4" />
					Export HTML
				</MenuItem>
				<MenuItem value="rename" disabled>
					<FolderPenIcon className="size-4" />
					Change name
				</MenuItem>

				<MenuItem value="delete" className="text-red-500 dark:text-red-500">
					<XIcon className="size-4" />
					Delete template
					<DeleteTemplateDialog {...params} {...deleteDialog.props} />
				</MenuItem>
			</Menu>

			<div className="flex gap-2 items-center">
				<Button
					type="button"
					color="neutral"
					trailing={<SendIcon className="size-4" />}
					onClick={handleSendTest}
					loading={sendTestMutation.isPending}
				>
					Send test
				</Button>
				<Button
					type="button"
					trailing={<CircleCheckBigIcon className="size-4" />}
					loading={updateTemplateMutation.isPending}
					onClick={() =>
						toast.promise(handleSaveChanges, {
							loading: "Saving changes...",
							success: "Changes saved successfully",
							error: "Failed to save changes",
						})
					}
				>
					Save changes
				</Button>
			</div>
		</div>
	);
}
