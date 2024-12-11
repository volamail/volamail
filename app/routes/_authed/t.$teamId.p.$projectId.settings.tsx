import { DeleteProjectDialog } from "@/modules/organization/components/delete-project-dialog";
import { updateProjectSettingsFn } from "@/modules/organization/mutations";
import {
	projectQueryOptions,
	teamQueryOptions,
	userTeamsOptions,
} from "@/modules/organization/queries";
import { Button } from "@/modules/ui/components/button";
import { DashboardPageHeader } from "@/modules/ui/components/dashboard-page-header";
import { FormGroup } from "@/modules/ui/components/form-group";
import { Label } from "@/modules/ui/components/label";
import { TextInput } from "@/modules/ui/components/text-input";
import { Tooltip } from "@/modules/ui/components/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute(
	"/_authed/t/$teamId/p/$projectId/settings",
)({
	component: RouteComponent,
	async loader({ context, params }) {
		await Promise.all([
			context.queryClient.ensureQueryData(teamQueryOptions(params.teamId)),
			context.queryClient.ensureQueryData(
				projectQueryOptions(params.teamId, params.projectId),
			),
		]);
	},
});

const settingsFormSchema = z.object({
	id: z
		.string()
		.max(32, "Must be shorter than 32 characters")
		.refine(
			(v) => slugify(v, { lower: true, strict: true }) === v,
			"Must contain only lowercase letters and hyphens",
		),
	name: z.string().max(32, "Must be shorter than 32 characters"),
});

type SettingsForm = z.infer<typeof settingsFormSchema>;

function RouteComponent() {
	const params = Route.useParams();

	const { data: team } = useSuspenseQuery(teamQueryOptions(params.teamId));
	const { data: project } = useSuspenseQuery(
		projectQueryOptions(params.teamId, params.projectId),
	);

	const form = useForm<SettingsForm>({
		resolver: zodResolver(settingsFormSchema),
		defaultValues: {
			id: project.id,
			name: project.name,
		},
	});

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateProjectSettingsFn,
		async onSuccess(data) {
			await queryClient.invalidateQueries(userTeamsOptions());

			toast.success("Project settings updated");

			if (data.updates.id) {
				await navigate({
					to: "/t/$teamId/p/$projectId/settings",
					params: {
						...params,
						projectId: data.updates.id,
					},
				});
			}
		},
	});

	return (
		<div className="flex flex-col items-center justify-start h-full py-16 px-8">
			<div className="flex flex-col gap-8 w-full max-w-3xl">
				<DashboardPageHeader
					title="Project settings"
					description="Manage this project's settings"
				/>

				<hr className="dark:border-gray-800" />

				<form
					className="flex flex-col gap-6"
					onSubmit={form.handleSubmit((values) =>
						mutation.mutate({
							data: {
								teamId: params.teamId,
								projectId: params.projectId,
								settings: values,
							},
						}),
					)}
				>
					<div className="flex flex-col gap-1.5 md:grid md:grid-cols-2 md:gap-4 items-start">
						<div className="flex flex-col">
							<Label htmlFor="id">Project ID</Label>
							<p className="text-gray-500 text-sm">
								This is the unique identifier for this project.
							</p>
						</div>
						<FormGroup error={form.formState.errors.id?.message}>
							<TextInput id="id" {...form.register("id")} />
						</FormGroup>
					</div>
					<div className="flex flex-col gap-1.5 md:grid md:grid-cols-2 md:gap-4 items-start">
						<div className="flex flex-col">
							<Label htmlFor="name">Name</Label>
							<p className="text-gray-500 text-sm">
								The name of this project. Also used in emails as the sender's
								name.
							</p>
						</div>
						<TextInput id="name" {...form.register("name")} />
					</div>

					<Button
						type="submit"
						className="self-end"
						loading={mutation.isPending}
						disabled={!form.formState.isDirty}
					>
						Save changes
					</Button>
				</form>

				<hr className="dark:border-gray-800" />

				<section className="flex flex-col gap-6 items-start">
					<div className="flex flex-col gap-1">
						<h2 className="font-medium text-lg text-white">Danger zone</h2>

						<p className="dark:text-gray-500 text-sm">
							Permanently delete this project. This action cannot be undone as
							all templates, media files, and data will be removed.
						</p>
					</div>

					{team.projects.length > 1 ? (
						<DeleteProjectDialog
							teamId={params.teamId}
							project={project}
							trigger={<Button color="red">Delete project</Button>}
						/>
					) : (
						<Tooltip content="Can't delete the only project in this team. A team must have at least one project.">
							<Button color="red" disabled>
								Delete project
							</Button>
						</Tooltip>
					)}
				</section>
			</div>
		</div>
	);
}
