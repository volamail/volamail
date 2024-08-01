import { GridBgContainer } from "~/lib/ui/components/grid-bg-container";

export function EditorSkeleton() {
  return (
    <div class="min-h-0 grow flex">
      <div class="w-72 border-r border-gray-200 p-4 flex flex-col gap-6 bg-white">
        <div class="flex flex-col gap-2 w-full animate-pulse">
          <div class="h-4 w-16 rounded bg-gray-100" />
          <div class="h-8 w-full rounded-lg bg-gray-100" />
        </div>
        <div class="flex flex-col gap-2 w-full animate-pulse">
          <div class="h-4 w-20 rounded bg-gray-100" />
          <div class="h-8 w-full rounded-lg bg-gray-100" />
        </div>
      </div>

      <GridBgContainer class="grow flex flex-col items-start p-8 gap-3 animate-pulse">
        <div class="h-10 w-40 rounded-lg bg-gray-100 z-10" />
        <div class="flex-1 h-4 w-full rounded-lg bg-gray-100 z-10" />
        <div class="h-10 w-full rounded-lg bg-gray-100 z-10" />
      </GridBgContainer>
    </div>
  );
}
