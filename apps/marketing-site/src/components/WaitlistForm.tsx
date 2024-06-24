import { Show, createSignal } from "solid-js";
import { ArrowDownIcon, CheckIcon, LoaderIcon, SendIcon } from "lucide-solid";

type Props = {
  error?: string;
  success?: boolean;
};

export function WaitlistForm(props: Props) {
  const [phase, setPhase] = createSignal<"idle" | "pending" | "success">(
    "idle"
  );

  const [error, setError] = createSignal(props.error);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    setPhase("pending");

    try {
      const response = await fetch(
        `${import.meta.env.DEV ? "http" : "https"}://${
          import.meta.env.PUBLIC_APP_DOMAIN
        }/api/waitlist/request-approval`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const body = await response.json();

        throw new Error(body.statusMessage);
      }

      setPhase("success");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "An error occurred while requesting access."
      );

      setPhase("idle");
    }
  }

  return (
    <form
      class="flex flex-col items-start gap-1 w-full relative"
      method="post"
      onSubmit={handleSubmit}
    >
      <label
        for="email"
        class="font-medium text-sm inline-flex gap-1 items-center"
      >
        Request early access
        <ArrowDownIcon class="size-4" />
      </label>
      <div
        class="has-[input:focus]:outline w-full outline-blue-600 px-1.5 rounded-xl bg-white border border-gray-300 overflow-hidden inline-flex gap-2 p-1 items-center"
        classList={{
          "border-red-500": error() !== undefined,
          "border-gray-300": error() === undefined,
        }}
      >
        <input
          type="email"
          name="email"
          id="email"
          placeholder="john.doe@example.com"
          class="text-sm px-1 outline-none w-full text-input autofill:bg-white bg-white"
        />
        <Show
          when={phase() !== "success"}
          fallback={
            <div class="rounded-full bg-black p-2">
              <CheckIcon class="size-3.5 text-green-500" />
            </div>
          }
        >
          <button
            type="submit"
            disabled={phase() === "pending"}
            class="font-medium disabled:opacity-50 p-2 rounded-full bg-black text-white inline-flex gap-2 items-center text-sm cursor-default hover:bg-gray-600 transition-colors"
          >
            <Show
              when={phase() === "idle"}
              fallback={<LoaderIcon class="size-3.5 animate-spin" />}
            >
              <SendIcon class="size-3.5" />
            </Show>
          </button>
        </Show>
      </div>

      <Show when={error() !== undefined}>
        <p class="text-xs text-red-500 pl-2 absolute -bottom-5">{error()}</p>
      </Show>
    </form>
  );
}
