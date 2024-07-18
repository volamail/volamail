import { LoaderIcon } from "lucide-solid";
import { type VariantProps, tv } from "tailwind-variants";
import { Show, splitProps, type ComponentProps, type JSX } from "solid-js";

const textareaVariants = tv({
  base: "w-full relative has-[:disabled]:bg-gray-100 has-[textarea:focus]:outline outline-blue-600 flex gap-2 px-2.5 py-2 items-center bg-white border rounded-lg border-gray-300",
  slots: {
    input: "resize-none outline-none text-sm w-full bg-transparent",
    loader: "animate-spin size-4",
  },
});

type Props = ComponentProps<"textarea"> & {
  leading?: () => JSX.Element;
  trailing?: () => JSX.Element;
  loading?: boolean;
  resizeable?: boolean;
  submitOnEnter?: boolean;
} & VariantProps<typeof textareaVariants> & {
    classes?: {
      input?: string;
      loader?: string;
    };
  };

export function Textarea(props: Props) {
  const [local, rest] = splitProps(props, [
    "trailing",
    "leading",
    "loading",
    "disabled",
    "class",
    "classes",
    "resizeable",
    "submitOnEnter",
  ]);

  return (
    <div class={textareaVariants().base(local)}>
      <Show when={local.leading}>{local.leading!()}</Show>

      <textarea
        {...rest}
        rows={rest.rows || 1}
        disabled={local.disabled || local.loading}
        class={textareaVariants().input({ class: local.classes?.input })}
        style={{
          // @ts-expect-error css types aren't up to date
          "field-sizing": local.resizeable ? "content" : undefined,
        }}
        onKeyDown={(event) => {
          if (local.submitOnEnter && event.key === "Enter") {
            event.preventDefault();

            const target = event.target as HTMLTextAreaElement;

            target.form!.requestSubmit();
          }
        }}
      />

      <Show
        when={local.loading}
        fallback={local.trailing ? local.trailing() : null}
      >
        <LoaderIcon
          class={textareaVariants().loader({ class: local.classes?.loader })}
        />
      </Show>
    </div>
  );
}
