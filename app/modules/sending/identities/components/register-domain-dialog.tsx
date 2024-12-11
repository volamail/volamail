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
import { addProjectDomainFn } from "../mutations";
import { projectDomainsOptions } from "../queries";

const formSchema = z.object({
	domain: z.string(),
});

interface Props {
	teamId: string;
	projectId: string;
	enabled?: boolean;
	trigger: React.ReactNode;
}

export function RegisterDomainDialog(props: Props) {
	const [open, setOpen] = useState(false);

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: addProjectDomainFn,
		async onSuccess() {
			await queryClient.invalidateQueries(
				projectDomainsOptions(props.teamId, props.projectId),
			);

			setOpen(false);

			toast.success("Domain registered successfully.");
		},
		onError() {
			toast.error("Failed to register domain.");
		},
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	return (
		<DialogRoot open={open} onOpenChange={({ open }) => setOpen(open)}>
			<DialogTrigger asChild>{props.trigger}</DialogTrigger>
			<DialogContent title="Register domain">
				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit((values) =>
						mutation.mutate({
							data: {
								domain: values.domain,
								projectId: props.projectId,
								teamId: props.teamId,
							},
						}),
					)}
				>
					<p className="text-sm dark:text-gray-400">
						You'll get a list of DNS records you'll need to add to your domain's
						DNS settings for verification.
					</p>

					<FormGroup
						label="Domain"
						error={form.formState.errors.domain?.message}
						hint="Prefixes such as http:// or www. aren't needed"
					>
						<TextInput {...form.register("domain")} placeholder="example.com" />
					</FormGroup>

					<div className="flex gap-2 justify-end mt-4">
						<DialogCloseTrigger asChild>
							<Button color="neutral">Cancel</Button>
						</DialogCloseTrigger>
						<Button type="submit" loading={mutation.isPending}>
							Register domain
						</Button>
					</div>
				</form>
			</DialogContent>
		</DialogRoot>
	);
}
