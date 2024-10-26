import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { type ObjectSchema, safeParseAsync } from "valibot";

// biome-ignore lint/suspicious/noExplicitAny: This is fine
type FormOptions<T extends Record<string, any>> = {
	// biome-ignore lint/suspicious/noExplicitAny: This is also fine
	schema?: ObjectSchema<Record<keyof T, any>, any>;
	defaultValues?: Partial<T>;
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
		fields: Object.keys(options.defaultValues || {}).reduce(
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

	async function validateField<Field extends keyof T>(
		field: Field,
		value: T[Field],
	) {
		if (!options.schema) {
			return null;
		}

		const validationResult = await safeParseAsync(
			options.schema.entries[field],
			value,
		);

		if (validationResult.success) {
			return null;
		}

		return validationResult.issues[0].message;
	}

	function createFieldTriggerUpdate<Field extends keyof T>(field: Field) {
		return async (value: T[Field]) => {
			// @ts-expect-error TODO: Fix this
			setStore("fields", field, "value", value);

			if (!store.form.submitted && !options.validateBeforeSubmit) {
				// @ts-expect-error TODO: Fix this
				setStore("fields", field, "dirty", true);

				return;
			}

			const error = await validateField(field, value);

			// @ts-expect-error TODO: Fix this
			setStore("fields", field, {
				error,
				dirty: true,
			});
		};
	}

	function getTextareaProps<Field extends keyof T>(field: Field) {
		const fieldState = store.fields[field];

		const triggerUpdate = createFieldTriggerUpdate(field);

		return {
			...fieldState,
			children: options.defaultValues?.[field] || "",
			name: field,
			ref(el: HTMLElement) {
				// @ts-expect-error TODO: Fix this
				setStore("fields", field, {
					ref: el,
				});
			},
			async onInput(event: Event) {
				if (!(event.target instanceof HTMLTextAreaElement)) {
					console.warn(
						"Bound a non-textarea element to an onInput handler. Please trigger change manually using the triggerUpdate function instead.",
					);

					return;
				}

				if (event.target.textContent === null) {
					return;
				}

				triggerUpdate(event.target.textContent as T[Field]);
			},
		};
	}

	function getFieldProps<Field extends keyof T>(field: Field) {
		const fieldState = store.fields[field];

		const triggerUpdate = createFieldTriggerUpdate(field);

		return {
			...fieldState,
			value: options.defaultValues?.[field] || "",
			name: field,
			ref(el: HTMLElement) {
				// @ts-expect-error TODO: Fix this
				setStore("fields", field, {
					ref: el,
				});
			},
			triggerUpdate,
			onInput(event: Event) {
				if (!(event.currentTarget instanceof HTMLInputElement)) {
					console.warn(
						"Bound a non-input element to an onInput handler. Please trigger change manually using the triggerUpdate function instead.",
					);

					return;
				}

				triggerUpdate(event.currentTarget.value as T[Field]);
			},
		};
	}

	async function handleSubmit(event: SubmitEvent) {
		setStore("form", "submitted", true);

		for (const field in store.fields) {
			const ref = store.fields[field].ref;

			if (!ref) {
				continue;
			}

			const value = ref.value as T[typeof field];

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
