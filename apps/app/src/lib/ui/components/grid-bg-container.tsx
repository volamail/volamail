// @refresh reload
import { twMerge } from "tailwind-merge";
import type { ComponentProps } from "solid-js";

type Props = ComponentProps<"div">;

export function GridBgContainer(props: Props) {
  return (
    <div
      class={twMerge(
        "flex flex-col justify-center items-center bg-grid-black/5 relative",
        props.class
      )}
    >
      <div class="absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white)]" />
      {props.children}
    </div>
  );
}
