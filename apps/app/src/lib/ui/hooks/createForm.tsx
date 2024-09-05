import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { type ObjectSchema, safeParseAsync } from "valibot";

// biome-ignore lint/suspicious/noExplicitAny: This is fine
type FormOptions<T extends Record<string, any>> = {
	// biome-ignore lint/suspicious/noExplicitAny: This is also fine
	schema: ObjectSchema<Record<keyof T, any>, any>;
	defaultValues: Partial<T>;
	validateBeforeSubmit?: boolean;
};

type FieldState = {
	dirty: boolean;
	error?: string;
	ref?: HTMLInputElement;
	value?: string;
};

// biome-ignore lint/suspicious/noExplicitAny: This is fine
export function createForm<T extends Record<string, any>>(
	options: FormOptions<T>,
) {
	const [store, setStore] = createStore({
		fields: Object.keys(options.defaultValues).reduce(
			(acc, current) => {
				const key = current as keyof T;

				acc[key] = {
					error: undefined,
					dirty: false,
				};

				return acc;
			},
			{} as Record<keyof T, FieldState>,
		),
		form: {
			dirty: false,
			invalid: false,
			submitted: false,
		},
	});

	async function validateField(field: keyof T, value: string) {
		const validationResult = await safeParseAsync(
			options.schema.entries[field],
			value,
		);

		if (validationResult.success) {
			return null;
		}

		return validationResult.issues[0].message;
	}

	function getTextareaProps<Field extends keyof T>(field: Field) {
		const fieldState = store.fields[field];

		return {
			...fieldState,
			children: options.defaultValues[field] as string,
			name: field,
			ref(el: HTMLElement) {
				// @ts-expect-error TODO: Fix this
				setStore("fields", field, {
					ref: el,
				});
			},
			async onInput(event: Event) {
				// @ts-expect-error TODO: Fix this
				setStore("fields", field, "value", event.currentTarget.value);

				if (!store.form.submitted && !options.validateBeforeSubmit) {
					// @ts-expect-error TODO: Fix this
					setStore("fields", field, "dirty", true);

					return;
				}

				const target = event.target as HTMLTextAreaElement;

				const value = target.value;

				const error = await validateField(field, value);

				// @ts-expect-error TODO: Fix this
				setStore("fields", field, {
					error,
					dirty: true,
				});
			},
		};
	}

	function getFieldProps(field: keyof T) {
		const fieldState = store.fields[field];

		return {
			...fieldState,
			value: options.defaultValues[field],
			name: field,
			ref(el: HTMLElement) {
				// @ts-expect-error TODO: Fix this
				setStore("fields", field, {
					ref: el,
				});
			},
			async onInput(event: Event) {
				// @ts-expect-error TODO: Fix this
				setStore("fields", field, "value", event.currentTarget.value);

				if (!store.form.submitted && !options.validateBeforeSubmit) {
					// @ts-expect-error TODO: Fix this
					setStore("fields", field, "dirty", true);

					return;
				}

				const target = event.target as HTMLInputElement;

				const value = target.value;

				const error = await validateField(field, value);

				// @ts-expect-error TODO: Fix this
				setStore("fields", field, {
					error,
					dirty: true,
				});
			},
		};
	}

	async function handleSubmit(event: SubmitEvent) {
		setStore("form", "submitted", true);

		for (const field of Object.keys(options.defaultValues)) {
			const ref = store.fields[field].ref;

			if (!ref) {
				continue;
			}

			const value = ref.value;

			const error = await validateField(field, value);

			if (error) {
				event.preventDefault();

				ref.focus();
				ref.select();
			}

			// @ts-expect-error TODO: Fix this
			setStore("fields", field, {
				error,
			});
		}

		if (store.form.invalid) {
			return;
		}
	}

	createEffect(() => {
		setStore("form", {
			dirty: Object.values(store.fields).some((field) => field.dirty),
			invalid: Object.values(store.fields).some((field) => field.error),
		});
	});

	return {
		getFieldProps,
		getTextareaProps,
		handleSubmit,
		state: store.form,
	};
}
