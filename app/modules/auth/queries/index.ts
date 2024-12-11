import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserFn } from "./get-current-user";

export const currentUserQueryOptions = () =>
	queryOptions({
		queryKey: ["currentUser"],
		staleTime: Number.POSITIVE_INFINITY,
		queryFn() {
			return getCurrentUserFn();
		},
	});
