import { createEffect } from "solid-js";
import type { H3Error } from "vinxi/http";
import { type Action, useSubmission } from "@solidjs/router";

export function useMutation<T extends Array<unknown>, U>(params: {
	action: Action<T, U>;
	onSuccess?: (result: U) => void;
	onError?: (error: H3Error) => void;
	filter?: (arg: T) => boolean;
}) {
	const submission = useSubmission(params.action, params.filter);

	createEffect((prev) => {
		const result = {
			result: submission.result,
			pending: submission.pending,
			error: submission.error,
		};

		const prevResult = prev as typeof result | undefined;

		if (result.pending && !prevResult?.pending) {
			return result;
		}

		if (result.error && prevResult?.pending) {
			return params.onError?.(result.error);
		}

		if (prevResult?.pending && !result.pending) {
			// biome-ignore lint/suspicious/noExplicitAny: Should be fine
			params.onSuccess?.(result.result as any);
		}

		return result;
	});

	return submission;
}
