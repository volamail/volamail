import { isErr } from "@/modules/rpcs/errors";
import { Button } from "@/modules/ui/components/button";
import { Callout } from "@/modules/ui/components/callout";
import {
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	type ImperativeDialogProps,
} from "@/modules/ui/components/dialog";
import { FormGroup } from "@/modules/ui/components/form-group";
import { TextInput } from "@/modules/ui/components/text-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";
import { createProjectFn } from "../mutations";
import { userTeamsOptions } from "../queries";

const formSchema = z.object({
	id: z
		.string()
		.trim()
		.min(3, "Must contain at least 3 characters")
		.max(32, "Can't be longer than 32 characters")
		.refine(
			(id) => slugify(id, { lower: true, strict: true }) === id,
			"Invalid format, use lowercase letters and dashes",
		),
	name: z
		.string()
		.trim()
		.min(3, "Must contain at least 3 characters")
		.max(32, "Can't be longer than 32 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateProjectDialog(
	props: ImperativeDialogProps<{ teamId: string }>,
) {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
	});

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createProjectFn,
		async onSuccess(data) {
			if (isErr(data)) {
				if (data.error === "PROJECT_ID_USED") {
					form.setError("id", {
						type: "value",
						message: "This team already has a project with this ID",
					});

					return;
				}

				if (data.error === "PROJECT_LIMIT_REACHED") {
					form.setError("root", {
						type: "validate",
						message: "You have reached the limit of projects in this team.",
					});

					return;
				}
			}

			await queryClient.invalidateQueries(userTeamsOptions());

			toast.success("Project created");

			await navigate({
				to: "/t/$teamId/p/$projectId/templates",
				params: {
					teamId: props.dynamicProps?.teamId,
					projectId: data.data.id,
				},
			});
		},
	});

	function handleSubmit(values: FormValues) {
		mutation.mutate({
			data: {
				id: values.id,
				name: values.name,
				teamId: props.dynamicProps?.teamId,
			},
		});
	}

	return (
		<DialogRoot
			open={props.dynamicProps !== null}
			onOpenChange={({ open }) => {
				if (!open) {
					props.onClose();
				}
			}}
		>
			<DialogContent title="Create project">
				<div className="flex flex-col gap-4">
					<p className="text-sm dark:text-gray-400">
						A new project will be added to this team.
					</p>

					<form
						className="flex flex-col gap-4"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<FormGroup
							label="Name"
							name="name"
							error={form.formState.errors.name?.message}
						>
							<TextInput
								placeholder="My new project"
								{...form.register("name", {
									onChange(event) {
										form.setValue(
											"id",
											slugify(event.target.value, {
												lower: true,
												strict: true,
											}),
										);
									},
								})}
							/>
						</FormGroup>
						<FormGroup
							label="Project ID"
							name="id"
							hint="Can only contain lowercase letters and dashes"
							error={form.formState.errors.id?.message}
						>
							<TextInput
								placeholder="my-new-project"
								{...form.register("id")}
							/>
						</FormGroup>

						{form.formState.errors.root?.message && (
							<Callout variant="error" className="mt-2">
								{form.formState.errors.root?.message}
							</Callout>
						)}

						<div className="mt-4 flex items-center justify-end gap-2">
							<DialogCloseTrigger asChild>
								<Button color="neutral">Cancel</Button>
							</DialogCloseTrigger>
							<Button type="submit" loading={mutation.isPending}>
								Create project
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
