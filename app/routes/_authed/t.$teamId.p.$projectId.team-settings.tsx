import { DeleteTeamDialog } from "@/modules/organization/components/delete-team-dialog";
import { updateTeamSettingsFn } from "@/modules/organization/mutations";
import {
	teamQueryOptions,
	userTeamsOptions,
} from "@/modules/organization/queries";
import { isErr } from "@/modules/rpcs/errors";
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
	"/_authed/t/$teamId/p/$projectId/team-settings",
)({
	component: RouteComponent,
	async loader({ context, params }) {
		await Promise.all([
			context.queryClient.ensureQueryData(teamQueryOptions(params.teamId)),
			context.queryClient.ensureQueryData(userTeamsOptions()),
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

	const { data: userTeams } = useSuspenseQuery(userTeamsOptions());
	const { data: team } = useSuspenseQuery(teamQueryOptions(params.teamId));

	const form = useForm<SettingsForm>({
		resolver: zodResolver(settingsFormSchema),
		defaultValues: {
			id: team.id,
			name: team.name,
		},
	});

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateTeamSettingsFn,
		async onSuccess(response) {
			if (isErr(response)) {
				if (response.error === "TEAM_ID_TAKEN") {
					form.setError("id", {
						type: "value",
						message: "This team ID is already taken",
					});
				}

				return;
			}

			await queryClient.invalidateQueries(userTeamsOptions());

			toast.success("Team settings updated");

			if ("id" in response.data.updates) {
				await navigate({
					to: Route.to,
					params: {
						...params,
						teamId: response.data.updates.id,
					},
				});
			}
		},
	});

	return (
		<div className="flex flex-col items-center justify-start h-full py-16 px-8">
			<div className="flex flex-col gap-8 w-full max-w-3xl">
				<DashboardPageHeader
					title="Team settings"
					description="Manage this team's settings"
				/>

				<hr className="dark:border-gray-800" />

				<form
					className="flex flex-col gap-6"
					onSubmit={form.handleSubmit((values) =>
						mutation.mutate({
							data: {
								teamId: params.teamId,
								settings: values,
							},
						}),
					)}
				>
					<div className="flex flex-col gap-1.5 md:grid md:grid-cols-2 md:gap-4 items-start">
						<div className="flex flex-col">
							<Label htmlFor="id">Team ID</Label>
							<p className="text-gray-500 text-sm">
								This is the unique identifier for this team.
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
								The display name of this team.
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
					<div className="flex flex-col gap-1 items-start">
						<h2 className="font-medium text-lg text-white">Danger zone</h2>

						<p className="dark:text-gray-500 text-sm mb-4">
							Permanently delete this team. This action cannot be undone and all
							projects within it will be lost.
						</p>

						{userTeams.length > 1 ? (
							<DeleteTeamDialog
								teamId={params.teamId}
								trigger={<Button color="red">Delete team</Button>}
							/>
						) : (
							<Tooltip content="Can't delete the only team for this account. An account must have at least one team.">
								<Button color="red" disabled>
									Delete team
								</Button>
							</Tooltip>
						)}
					</div>
				</section>
			</div>
		</div>
	);
}
