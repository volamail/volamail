import { currentUserQueryOptions } from "@/modules/auth/queries";
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
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deleteTeamFn } from "../mutations";

interface Props {
	teamId: string;
	trigger: ReactNode;
}

export function DeleteTeamDialog(props: Props) {
	const formSchema = z.object({
		confirm: z.string().refine((value) => value.toLowerCase() === props.teamId),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			confirm: "",
		},
	});

	const confirmed = form.watch("confirm").toLowerCase() === props.teamId;

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: deleteTeamFn,
		async onSuccess(data) {
			toast.success("Team deleted");

			await queryClient.invalidateQueries(currentUserQueryOptions());

			await navigate({
				to: "/t/$teamId/p/$projectId/templates",
				params: {
					teamId: data.teamToRedirectToId,
					projectId: data.projectToRedirectToId,
				},
			});
		},
	});

	return (
		<DialogRoot>
			<DialogTrigger asChild>{props.trigger}</DialogTrigger>
			<DialogContent title="Delete team">
				<form
					className="flex flex-col gap-2"
					onSubmit={form.handleSubmit(() =>
						mutation.mutate({
							data: {
								teamId: props.teamId,
							},
						}),
					)}
				>
					<p className="text-sm text-gray-500">
						Are you sure you want to delete this team? This action cannot be
						undone.
					</p>

					<p className="text-sm text-gray-500 mt-4">
						Type{" "}
						<span className="rounded dark:text-gray-300">
							{props.teamId.toLowerCase()}
						</span>{" "}
						to delete the team.
					</p>

					<FormGroup
						name="confirm"
						error={form.formState.errors.confirm?.message}
					>
						<TextInput {...form.register("confirm")} />
					</FormGroup>

					<div className="flex justify-end space-x-2 mt-6">
						<DialogCloseTrigger asChild>
							<Button color="neutral" type="button">
								Cancel
							</Button>
						</DialogCloseTrigger>
						<Button color="red" disabled={!confirmed}>
							Delete team
						</Button>
					</div>
				</form>
			</DialogContent>
		</DialogRoot>
	);
}
