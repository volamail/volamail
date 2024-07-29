import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { ObjectSchema, safeParseAsync } from "valibot";

type FormOptions<T extends Record<string, any>> = {
  schema: ObjectSchema<any, any>;
  defaultValues: T;
};

type FieldState = {
  value: string;
  name: string;
  dirty: boolean;
  touched: boolean;
  error?: string;
  onChange?: (event: Event) => void;
  onBlur?: (event: Event) => void;
};

export function createForm<T extends Record<string, string>>(
  options: FormOptions<T>
) {
  async function validateField(field: { name: string; value: string }) {
    const validationResult = await safeParseAsync(
      options.schema.entries[field.name],
      field.value
    );

    if (validationResult.success) {
      return null;
    }

    return validationResult.issues[0].message;
  }

  const [store, setStore] = createStore<{
    fields: Record<keyof T, FieldState>;
    state: {
      dirty: boolean;
      touched: boolean;
      invalid: boolean;
      submitted: boolean;
    };
  }>({
    fields: Object.entries(options.defaultValues).reduce((acc, current) => {
      const [key, value] = current as [keyof T, string];

      return {
        ...acc,
        [key]: {
          value,
          error: undefined,
          touched: false,
          dirty: false,
          name: key,
          async onChange(event: Event) {
            const target = event.target as HTMLInputElement;

            let error: string | null = null;

            if (store.state.submitted) {
              error = await validateField({
                name: key as string,
                value: target.value,
              });
            }

            // @ts-expect-error TODO: Fix this
            setStore("fields", key, {
              dirty: true,
              touched: true,
              error,
              value: target.value,
            });
          },
          async onBlur(event: Event) {
            const target = event.target as HTMLInputElement;

            let error: string | null = null;

            if (store.state.submitted) {
              error = await validateField({
                name: key as string,
                value: target.value,
              });
            }

            // @ts-expect-error TODO: Fix this
            setStore("fields", key, {
              dirty: true,
              touched: true,
              error,
              value: target.value,
            });
          },
        },
      };
    }, {} as Record<keyof T, FieldState>),
    state: {
      dirty: false,
      touched: false,
      invalid: false,
      submitted: false,
    },
  });

  createEffect(() => {
    setStore("state", {
      dirty: Object.values(store.fields).some((field) => field.dirty),
      invalid: Object.values(store.fields).some((field) => field.error),
    });
  });

  return {
    fields: store.fields,
    form: store.state,
    async handleSubmit(event: Event) {
      setStore("state", "submitted", true);

      for (const key in store.fields) {
        const error = await validateField({
          name: key as string,
          value: store.fields[key as keyof T].value,
        });

        if (error) {
          // @ts-expect-error TODO: Fix this
          setStore("fields", key, {
            error,
          });

          event.preventDefault();
        }
      }
    },
  };
}
