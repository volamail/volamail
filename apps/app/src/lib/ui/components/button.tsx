import { LoaderIcon } from "lucide-solid";
import { type JSX, splitProps, Show, ValidComponent } from "solid-js";
import { type VariantProps, tv } from "tailwind-variants";
import {
  Button as KobalteButton,
  ButtonRootProps as KobalteButtonRootProps,
} from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";

export const buttonVariants = tv({
  base: "shrink-0 flex transition-colors cursor-default justify-center items-center gap-1.5 font-medium text-sm disabled:opacity-80 disabled:pointer-events-none",
  variants: {
    variant: {
      solid: "",
      outline: "shadow-sm",
      ghost: "",
    },
    even: {
      true: "p-1.5",
      false: "px-2.5 py-1",
    },
    round: {
      true: "rounded-full",
      false: "rounded-lg",
    },
    color: {
      primary: "",
      destructive: "",
      success: "",
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "solid",
      class: "bg-black text-white hover:bg-gray-700 hover:text-white",
    },
    {
      color: "destructive",
      variant: "solid",
      class: "bg-red-500 text-white hover:bg-red-600",
    },
    {
      color: "success",
      variant: "solid",
      class: "bg-green-500 text-white hover:bg-green-600",
    },
    {
      color: "primary",
      variant: "outline",
      class:
        "bg-transparent border border-gray-200 text-black hover:bg-gray-100",
    },
    {
      color: "destructive",
      variant: "outline",
      class:
        "bg-transparent border border-red-500 text-red-500 hover:bg-red-200",
    },
    {
      color: "success",
      variant: "outline",
      class:
        "bg-transparent border border-green-500 text-green-500 hover:bg-green-200",
    },
    {
      color: "primary",
      variant: "ghost",
      class:
        "bg-transparent hover:bg-gray-200 text-black disabled:bg-gray-100 disabled:text-gray-500",
    },
    {
      color: "destructive",
      variant: "ghost",
      class:
        "bg-transparent hover:bg-red-200 text-red-500 disabled:bg-red-100 disabled:text-red-500",
    },
    {
      color: "success",
      variant: "ghost",
      class:
        "bg-transparent hover:bg-green-200 text-green-500 disabled:bg-green-100 disabled:text-green-500",
    },
  ],
  defaultVariants: {
    even: false,
    square: false,
    color: "primary",
    variant: "solid",
  },
});

export type ButtonProps<T extends ValidComponent = "button"> =
  KobalteButtonRootProps<T> &
    VariantProps<typeof buttonVariants> & {
      class?: string | undefined;
      loading?: boolean;
      icon?: () => JSX.Element;
      children?: JSX.Element;
    };

export function Button<T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>
) {
  const [local, rest] = splitProps(props as ButtonProps, [
    "variant",
    "class",
    "even",
    "round",
    "loading",
    "icon",
    "color",
  ]);

  return (
    <KobalteButton
      class={buttonVariants(local)}
      disabled={local.loading || props.disabled}
      {...rest}
    >
      {props.children}

      <Show when={local.loading} fallback={local.icon ? local.icon() : null}>
        <LoaderIcon class="animate-spin size-4" />
      </Show>
    </KobalteButton>
  );
}
