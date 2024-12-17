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
import { deleteProjectFn } from "../mutations";

interface Props {
	teamId: string;
	project: {
		id: string;
		name: string;
	};
	trigger: ReactNode;
}

export function DeleteProjectDialog(props: Props) {
	const formSchema = z.object({
		confirm: z
			.string()
			.refine(
				(value) => value.toLowerCase() === props.project.name.toLowerCase(),
			),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			confirm: "",
		},
	});

	const confirmed =
		form.watch("confirm").toLowerCase() === props.project.name.toLowerCase();

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: deleteProjectFn,
		async onSuccess(data) {
			toast.success("Project deleted");

			await queryClient.invalidateQueries(currentUserQueryOptions());

			await navigate({
				to: "/t/$teamId/p/$projectId/templates",
				params: {
					teamId: props.teamId,
					projectId: data.projectToRedirectToId,
				},
			});
		},
		onError() {
			toast.error("Failed to delete project");
		},
	});

	return (
		<DialogRoot>
			<DialogTrigger asChild>{props.trigger}</DialogTrigger>
			<DialogContent title="Delete project">
				<form
					className="flex flex-col gap-2"
					onSubmit={form.handleSubmit(() =>
						mutation.mutate({
							data: {
								teamId: props.teamId,
								projectId: props.project.id,
							},
						}),
					)}
				>
					<p className="text-gray-500 text-sm">
						Are you sure you want to delete this project? This action cannot be
						undone.
					</p>

					<p className="mt-4 text-gray-500 text-sm">
						Type{" "}
						<span className="rounded dark:text-gray-300">
							{props.project.name.toLowerCase()}
						</span>{" "}
						to delete the project.
					</p>

					<FormGroup
						name="confirm"
						error={form.formState.errors.confirm?.message}
					>
						<TextInput {...form.register("confirm")} />
					</FormGroup>

					<div className="mt-6 flex justify-end space-x-2">
						<DialogCloseTrigger asChild>
							<Button color="neutral" type="button">
								Cancel
							</Button>
						</DialogCloseTrigger>
						<Button color="red" disabled={!confirmed}>
							Delete project
						</Button>
					</div>
				</form>
			</DialogContent>
		</DialogRoot>
	);
}
