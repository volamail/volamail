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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createApiTokenFn } from "../mutations";
import { projectApiTokensQueryOptions } from "../queries";

const formSchema = z.object({
	description: z.string(),
});

interface Props {
	teamId: string;
	projectId: string;
}

export function CreateApiTokenDialog(props: Props) {
	const [open, setOpen] = useState(false);

	const { handleSubmit, formState, register } = useForm<
		z.infer<typeof formSchema>
	>({
		resolver: zodResolver(formSchema),
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createApiTokenFn,
		async onSuccess() {
			await queryClient.invalidateQueries(
				projectApiTokensQueryOptions(props.teamId, props.projectId),
			);
		},
	});

	return (
		<DialogRoot open={open} onOpenChange={({ open }) => setOpen(open)}>
			<DialogTrigger asChild>
				<Button>Generate an API token</Button>
			</DialogTrigger>
			<DialogContent title="Generate an API token">
				{mutation.data ? (
					<>
						<p className="text-sm dark:text-gray-400">
							Here's the generated API token:
						</p>

						<div className="flex items-center justify-center rounded-md p-4 text-center font-mono text-xs dark:bg-gray-700">
							{mutation.data}
						</div>

						<p className="text-sm dark:text-gray-400">
							Make sure to copy this token somewhere safe, as it won't be shown
							again.
						</p>

						<DialogCloseTrigger asChild>
							<Button color="neutral" className="mt-4" padding="lg">
								Okay, I copied the token
							</Button>
						</DialogCloseTrigger>
					</>
				) : (
					<form
						className="flex flex-col gap-4"
						onSubmit={handleSubmit((values) =>
							mutation.mutate({
								data: {
									teamId: props.teamId,
									projectId: props.projectId,
									description: values.description,
								},
							}),
						)}
					>
						<p className="text-sm dark:text-gray-400">
							A token will full access to this project will be generated, and
							it'll be shown to you once to store it somewhere safe.
						</p>
						<FormGroup
							label="Description"
							hint="A word or short sentence to explain where the token is used"
							error={formState.errors.description?.message}
						>
							<TextInput {...register("description")} />
						</FormGroup>

						<div className="mt-4 flex justify-end gap-2">
							<DialogCloseTrigger asChild>
								<Button color="neutral">Cancel</Button>
							</DialogCloseTrigger>
							<Button type="submit" loading={mutation.isPending}>
								Generate token
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</DialogRoot>
	);
}
