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
import { sendTeamInviteFn } from "../mutations";
import { teamInvitesOptions } from "../queries";

const formSchema = z.object({
	email: z.string().email(),
});

interface Props {
	teamId: string;
}

export function InviteMemberDialog(props: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: sendTeamInviteFn,
		async onSuccess() {
			await queryClient.invalidateQueries(teamInvitesOptions(props.teamId));

			toast.success("Invite sent!");

			setIsOpen(false);
		},
		onError() {
			toast.error("Failed to send invite");
		},
	});

	function handleSubmit(values: z.infer<typeof formSchema>) {
		mutation.mutate({
			data: {
				teamId: props.teamId,
				email: values.email,
			},
		});
	}

	return (
		<DialogRoot open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
			<DialogTrigger asChild>
				<Button>Invite a Member</Button>
			</DialogTrigger>
			<DialogContent title="Invite a member">
				<form
					className="flex flex-col gap-4"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<p className="text-sm dark:text-gray-400">
						They'll receive an email with an invitation to join your
						organization.
					</p>

					<FormGroup
						name="email"
						label="Email"
						error={form.formState.errors.email?.message}
					>
						<TextInput
							type="email"
							placeholder="john.doe@example.com"
							{...form.register("email")}
						/>
					</FormGroup>

					<div className="flex justify-end gap-2">
						<DialogCloseTrigger asChild>
							<Button color="neutral">Cancel</Button>
						</DialogCloseTrigger>

						<Button type="submit" loading={mutation.isPending}>
							Send invite
						</Button>
					</div>
				</form>
			</DialogContent>
		</DialogRoot>
	);
}
