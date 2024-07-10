import { LoaderIcon } from "lucide-solid";
import { type VariantProps, tv } from "tailwind-variants";
import { Show, splitProps, type ComponentProps, type JSX } from "solid-js";

const inputVariants = tv({
  base: "w-full relative has-[:aria-disabled]:bg-gray-100 has-[:disabled]:bg-gray-100 has-[input:focus]:outline outline-blue-600 flex gap-2 px-2.5 items-center bg-white border rounded-lg border-gray-300",
  slots: {
    input:
      "text-input py-1.5 outline-none text-sm w-full bg-white autofill:bg-white aria-disabled:bg-gray-100 disabled:bg-gray-100 aria-disabled:text-gray-500 disabled:text-gray-500",
    loader: "animate-spin size-4",
  },
});

type Props = ComponentProps<"input"> & {
  leading?: () => JSX.Element;
  trailing?: () => JSX.Element;
  loading?: boolean;
  resizeable?: boolean;
} & VariantProps<typeof inputVariants> & {
    classes?: {
      input?: string;
      loader?: string;
    };
  };

export function Input(props: Props) {
  const [local, rest] = splitProps(props, [
    "trailing",
    "leading",
    "loading",
    "disabled",
    "class",
    "classes",
    "resizeable",
  ]);

  return (
    <div class={inputVariants().base(local)}>
      <Show when={local.leading}>{local.leading!()}</Show>

      <input
        {...rest}
        disabled={local.disabled}
        aria-disabled={local.loading}
        class={inputVariants().input({ class: local.classes?.input })}
        style={{
          // @ts-expect-error css types aren't up to date
          "field-sizing": local.resizeable ? "content" : undefined,
        }}
      />

      <Show
        when={local.loading}
        fallback={local.trailing ? local.trailing() : null}
      >
        <LoaderIcon
          class={inputVariants().loader({ class: local.classes?.loader })}
        />
      </Show>
    </div>
  );
}
