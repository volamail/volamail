import { Title } from "@solidjs/meta";

import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export default function NotFound() {
  return (
    <GridBgContainer>
      <Title>Not found - Voramail</Title>
      <h1 class="text-4xl font-bold">Not found</h1>
    </GridBgContainer>
  );
}
