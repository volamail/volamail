import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { ObjectSchema, safeParseAsync } from "valibot";

type FormOptions<T extends Record<string, any>> = {
  schema: ObjectSchema<Record<keyof T, any>, any>;
  defaultValues: Partial<T>;
  validateBeforeSubmit?: boolean;
};

type FieldState = {
  dirty: boolean;
  error?: string;
  ref?: HTMLInputElement;
};

export function createForm<T extends Record<string, any>>(
  options: FormOptions<T>
) {
  const [store, setStore] = createStore({
    fields: Object.keys(options.defaultValues).reduce((acc, current) => {
      return {
        ...acc,
        [current]: {
          error: undefined,
          dirty: false,
        },
      };
    }, {} as Record<keyof T, FieldState>),
    form: {
      dirty: false,
      invalid: false,
      submitted: false,
    },
  });

  async function validateField(field: keyof T, value: string) {
    const validationResult = await safeParseAsync(
      options.schema.entries[field],
      value
    );

    if (validationResult.success) {
      return null;
    }

    return validationResult.issues[0].message;
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
      async onChange(event: Event) {
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

  async function handleSubmit(event: Event) {
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
  }

  createEffect(() => {
    setStore("form", {
      dirty: Object.values(store.fields).some((field) => field.dirty),
      invalid: Object.values(store.fields).some((field) => field.error),
    });
  });

  return {
    getFieldProps,
    handleSubmit,
    state: store.form,
  };
}
