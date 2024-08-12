import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import * as ToastPrimitive from "@kobalte/core/toast";
import { CheckIcon, XCircleIcon, XIcon } from "lucide-solid";
import { splitProps } from "solid-js";
import type { Component, JSX, ValidComponent } from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { type VariantProps, tv } from "tailwind-variants";

type ToasterProps<T extends ValidComponent = "ol"> = PolymorphicProps<
  T,
  ToastPrimitive.ToastListProps
>;

const Toaster: Component<ToasterProps> = (props) => {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <Portal>
      <ToastPrimitive.Region duration={1500}>
        <ToastPrimitive.List
          class={twMerge(
            "fixed z-[100] h-dvh flex max-h-screen w-full gap-2 p-4 bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse pointer-events-none items-center",
            props.class
          )}
          {...rest}
        />
      </ToastPrimitive.Region>
    </Portal>
  );
};

const toastVariants = tv({
  base: "group pointer-events-auto relative bg-black flex gap-2 w-auto shrink-0 items-center justify-between overflow-hidden border px-2.5 py-1.5 text-xs rounded-full shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--kb-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--kb-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[opened]:animate-in data-[closed]:animate-out data-[swipe=end]:animate-out data-[closed]:fade-out data-[closed]:slide-out-to-bottom-full data-[opened]:slide-in-from-top-full data-[opened]:sm:slide-in-from-bottom-full",
  variants: {
    variant: {
      success: "success text-green-500",
      error: "error text-red-500",
    },
  },
});

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

type ToastProps<T extends ValidComponent = "li"> = PolymorphicProps<
  T,
  ToastPrimitive.ToastRootProps
> &
  VariantProps<typeof toastVariants>;

const Toast: Component<ToastProps> = (props) => {
  const [, rest] = splitProps(props, ["class", "variant"]);

  return (
    <ToastPrimitive.Root
      class={twMerge(toastVariants({ variant: props.variant }), props.class)}
      {...rest}
    />
  );
};

type ToastCloseButtonProps<T extends ValidComponent = "button"> =
  PolymorphicProps<T, ToastPrimitive.ToastCloseButtonProps>;

const ToastClose: Component<ToastCloseButtonProps> = (props) => {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <ToastPrimitive.CloseButton
      class={twMerge(
        "rounded-md text-white focus:outline-none cursor-default hover:text-gray-400 transition-colors focus:ring-2",
        props.class
      )}
      {...rest}
    >
      <XIcon class="size-4" />
    </ToastPrimitive.CloseButton>
  );
};

type ToastTitleProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  ToastPrimitive.ToastTitleProps
>;

const ToastTitle: Component<ToastTitleProps> = (props) => {
  const [, rest] = splitProps(props, ["class"]);

  return (
    <ToastPrimitive.Title
      class={twMerge(
        "text-sm font-medium shrink-0 whitespace-nowrap text-white",
        props.class
      )}
      {...rest}
    />
  );
};

function showToast(props: {
  title?: JSX.Element;
  description?: JSX.Element;
  variant: ToastVariant;
  duration?: number;
}) {
  ToastPrimitive.toaster.show((data) => (
    <Toast
      toastId={data.toastId}
      variant={props.variant}
      duration={props.duration}
    >
      {props.variant === "success" ? (
        <CheckIcon class="size-4 text-current" />
      ) : props.variant === "error" ? (
        <XCircleIcon class="size-4 text-current" />
      ) : null}
      {props.title && <ToastTitle>{props.title}</ToastTitle>}
      <ToastClose />
    </Toast>
  ));
}

export { Toaster, Toast, ToastClose, ToastTitle, showToast };
