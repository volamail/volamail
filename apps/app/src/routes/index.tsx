// @refresh reload
import { A } from "@solidjs/router";
import { ArrowRightIcon } from "lucide-solid";

import { buttonVariants } from "~/lib/ui/components/button";
import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";
import { Title } from "@solidjs/meta";

export default function Home() {
  return (
    <GridBgContainer>
      <Title>Simple email for everyone - Voramail</Title>
      <div class="max-w-5xl w-full flex justify-between items-center p-8 relative">
        <div class="flex flex-col gap-4 max-w-md">
          <h1 class="text-5xl font-black text-left">
            Simple email
            <br /> for everyone
          </h1>
          <p class="text-left text-gray-700">
            Write templates in markdown and send them with an API call. E-mail
            shouldn't be so difficult.
          </p>

          <A
            href="login"
            class={buttonVariants({
              class: "py-2 rounded-full self-start px-4 mt-8",
            })}
          >
            Sign in <ArrowRightIcon class="size-4" />
          </A>
        </div>
        <img
          src="/assets/mockup.png"
          class="md:opacity-100 opacity-20 w-96 absolute top-1/2 -translate-y-1/2 right-0"
          alt=""
        />
      </div>
    </GridBgContainer>
  );
}
