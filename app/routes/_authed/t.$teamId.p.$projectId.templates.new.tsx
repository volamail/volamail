import { projectQueryOptions } from "@/modules/organization/queries";
import { TemplateEditor } from "@/modules/templates/components/template-editor";
import {
	createTemplateFn,
	sendTemplateTestFn,
} from "@/modules/templates/mutations";
import { projectTemplatesQueryOptions } from "@/modules/templates/queries";
import { EditorStoreProvider, useEditorStore } from "@/modules/templates/store";
import { Button } from "@/modules/ui/components/button";
import {
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@/modules/ui/components/dialog";
import { FormGroup } from "@/modules/ui/components/form-group";
import { TextInput } from "@/modules/ui/components/text-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CircleCheckBigIcon, SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute(
	"/_authed/t/$teamId/p/$projectId/templates/new",
)({
	component: RouteComponent,
	async loader({ context, params }) {
		const project = await context.queryClient.ensureQueryData(
			projectQueryOptions(params.teamId, params.projectId),
		);

		return { project };
	},
});

function RouteComponent() {
	const { project } = Route.useLoaderData();

	return (
		<div className="flex h-dvh flex-col">
			<EditorStoreProvider
				defaultLanguage={project.defaultTemplateLanguage}
				theme={project.defaultTheme}
			>
				<div className="flex items-center justify-between border-b px-3 py-2 dark:border-gray-800">
					<div className="flex flex-col">
						<h3 className="font-medium">New template</h3>
						<p className="text-gray-500 text-sm">
							Create a new template for this project
						</p>
					</div>
					<NewTemplateActions />
				</div>

				<TemplateEditor />
			</EditorStoreProvider>
		</div>
	);
}

const dialogFormSchema = z.object({
	slug: z
		.string()
		.min(4)
		.max(32)
		.refine((slug) => slugify(slug, { lower: true, strict: true }) === slug),
});

function NewTemplateActions(props) {
	const params = Route.useParams();

	const store = useEditorStore();

	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof dialogFormSchema>>({
		resolver: zodResolver(dialogFormSchema),
	});

	const navigate = useNavigate();

	const createTemplateMutation = useMutation({
		mutationFn: createTemplateFn,
		async onSuccess() {
			queryClient.invalidateQueries({
				queryKey: projectTemplatesQueryOptions(params.teamId, params.projectId)
					.queryKey,
			});

			await navigate({
				to: `/t/${params.teamId}/p/${params.projectId}/templates`,
			});
		},
		onError(error) {
			console.log(error);
		},
	});

	const sendTestMutation = useMutation({
		mutationFn: sendTemplateTestFn,
	});

	async function handleCreateTemplate(
		values: z.infer<typeof dialogFormSchema>,
	) {
		toast.promise(
			() =>
				createTemplateMutation.mutateAsync({
					data: {
						teamId: params.teamId,
						projectId: params.projectId,
						template: {
							slug: values.slug,
							defaultTranslation: store.template.defaultTranslation,
							translations: store.template.translations.toJSON(),
							theme: store.theme,
						},
					},
				}),
			{
				loading: "Creating template...",
				success: "Template created!",
				error: "Failed to create template.",
			},
		);
	}

	async function handleSendTest() {
		toast.promise(
			() =>
				sendTestMutation.mutateAsync({
					data: {
						teamId: params.teamId,
						projectId: params.projectId,
						template: {
							subject: store.template.currentTranslation.subject,
							contents: store.template.defaultTranslation.contents,
						},
						theme: store.theme,
					},
				}),
			{
				loading: "Sending test email...",
				success: "Test email sent!",
				error: "Failed to send test email.",
			},
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				color="neutral"
				trailing={<SendIcon className="size-4" />}
				onClick={handleSendTest}
				loading={sendTestMutation.isPending}
			>
				Send test
			</Button>
			<DialogRoot>
				<DialogTrigger asChild>
					<Button
						color="primary"
						trailing={<CircleCheckBigIcon className="size-4" />}
					>
						Create template
					</Button>
				</DialogTrigger>
				<DialogContent title="Create template">
					<p className="text-sm dark:text-gray-400">
						Enter a name to identify this template.
					</p>

					<form
						className="mt-4 flex flex-col gap-6"
						onSubmit={form.handleSubmit(handleCreateTemplate)}
					>
						<FormGroup
							label="Name"
							hint="Can only contain lowercase letters, numbers and dashes."
							error={form.formState.errors.slug?.message}
						>
							<TextInput
								{...form.register("slug")}
								placeholder="my-awesome-template"
							/>
						</FormGroup>

						<div className="flex justify-end gap-2">
							<DialogCloseTrigger asChild>
								<Button color="neutral">Cancel</Button>
							</DialogCloseTrigger>
							<Button
								type="submit"
								trailing={<CircleCheckBigIcon className="size-4" />}
								loading={createTemplateMutation.isPending}
							>
								Save template
							</Button>
						</div>
					</form>
				</DialogContent>
			</DialogRoot>
		</div>
	);
}
