import { authClient } from "@/modules/auth/client";
import { currentUserQueryOptions } from "@/modules/auth/queries";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";
import { ActionButton } from "../action-button";
import { Avatar } from "../avatar";

export function SidebarUserSection() {
	const { data: user } = useSuspenseQuery(currentUserQueryOptions());

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const logoutMutation = useMutation({
		mutationFn() {
			return authClient.signOut();
		},
		async onSuccess() {
			await navigate({
				to: "/login",
			});

			queryClient.invalidateQueries({
				queryKey: ["currentUser"],
			});
		},
	});

	return (
		<div className="flex items-center gap-2">
			<Avatar src={user?.image} fallback={user!.name.charAt(0).toUpperCase()} />
			<div className="flex grow flex-col overflow-hidden">
				<span className="grow truncate font-medium text-gray-900 text-sm dark:text-gray-50">
					{user?.name}
				</span>
				<span className="text-gray-500 text-xs">Admin</span>
			</div>

			<ActionButton
				onClick={() => logoutMutation.mutate()}
				variant="ghost"
				color="neutral"
				loading={logoutMutation.isPending}
			>
				<LogOutIcon className="size-4" />
			</ActionButton>
		</div>
	);
}
