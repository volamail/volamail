import { JSX } from "solid-js";

type Props = {
  children: JSX.Element | JSX.Element[];
};

export function Kbd(props: Props) {
  return (
    <div class="rounded-md text-xs inline-flex gap-1 items-center border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-gray-600 font-mono">
      {props.children}
    </div>
  );
}
