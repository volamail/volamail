import { createEffect } from "solid-js";
import { type Action, useSubmission } from "@solidjs/router";

export function useMutation<T extends Array<unknown>, U>(params: {
  action: Action<T, U>;
  onSuccess?: (result: U) => void;
  onError?: (error: unknown) => void;
}) {
  const submission = useSubmission(params.action);

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
      params.onError?.(result.error);
    }

    if (result.result && prevResult?.pending) {
      params.onSuccess?.(result.result);
    }

    return result;
  });

  return submission;
}
