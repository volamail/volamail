export function ok<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}

export function err<E>(err: E) {
  return {
    success: false as const,
    error: err,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: fuck off
export function isOk(result: any): result is { success: true } {
  return result?.success === true;
}

// biome-ignore lint/suspicious/noExplicitAny: fuck off
export function isErr(result: any): result is { success: false } {
  return result?.success === false;
}
