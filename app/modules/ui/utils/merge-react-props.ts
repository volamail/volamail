// biome-ignore lint/suspicious/noExplicitAny: don't know/care about prop types
type AnyProps = Record<string, any>;

export function mergeReactProps(parentProps: AnyProps, childProps: AnyProps) {
	// All child props should override.
	const overrideProps = { ...childProps };

	for (const propName in childProps) {
		const parentPropValue = parentProps[propName];
		const childPropValue = childProps[propName];

		const isHandler = /^on[A-Z]/.test(propName);
		// If it's a handler, modify the override by composing the base handler.
		if (isHandler) {
			// Only compose the handlers if both exist.
			if (childPropValue && parentPropValue) {
				overrideProps[propName] = (...args: unknown[]) => {
					childPropValue?.(...args);
					parentPropValue?.(...args);
				};
				// Otherwise, avoid creating an unnecessary callback.
			} else if (parentPropValue) {
				overrideProps[propName] = parentPropValue;
			}
		} else if (propName === "style") {
			overrideProps[propName] = { ...parentPropValue, ...childPropValue };
		} else if (propName === "className") {
			overrideProps[propName] = [parentPropValue, childPropValue]
				.filter(Boolean)
				.join(" ");
		}
	}

	return { ...parentProps, ...overrideProps };
}
