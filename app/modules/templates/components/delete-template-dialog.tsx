import { Button } from "@/modules/ui/components/button";
import {
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	type ImperativeDialogProps,
} from "@/modules/ui/components/dialog";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { deleteTemplateFn } from "../mutations";

export function DeleteTemplateDialog(
	props: ImperativeDialogProps<{
		teamId: string;
		projectId: string;
		slug: string;
	}>,
) {
	const { dynamicProps, ...rest } = props;

	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: deleteTemplateFn,
		onSuccess() {
			toast.success("Template deleted");

			navigate({
				to: "/t/$teamId/p/$projectId/templates",
				params: {
					teamId: dynamicProps!.teamId,
					projectId: dynamicProps!.projectId,
				},
			});
		},
	});

	return (
		<DialogRoot {...rest}>
			<DialogContent title="Delete Template">
				<p className="text-sm dark:text-gray-400">
					Are you sure you want to delete this template? This action cannot be
					undone.
				</p>

				<div className="mt-6 flex justify-end gap-2">
					<DialogCloseTrigger asChild>
						<Button color="neutral">Cancel</Button>
					</DialogCloseTrigger>

					<Button
						color="red"
						loading={mutation.isPending}
						onClick={() =>
							mutation.mutate({
								data: {
									teamId: dynamicProps!.teamId,
									projectId: dynamicProps!.projectId,
									slug: dynamicProps!.slug,
								},
							})
						}
					>
						Delete template
					</Button>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
