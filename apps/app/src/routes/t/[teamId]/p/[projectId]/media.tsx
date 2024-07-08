import { Title } from "@solidjs/meta";
import {
  type RouteDefinition,
  type RouteSectionProps,
  createAsync,
} from "@solidjs/router";
import { For, Show } from "solid-js";

import { AddImageDialog } from "~/lib/media/components/add-image-dialog";
import { DeleteImageDialog } from "~/lib/media/components/delete-image-dialog";
import { EditMediaDialog } from "~/lib/media/components/edit-media-dialog";
import { getProjectImages } from "~/lib/media/queries";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "~/lib/ui/components/dialog";

export const route: RouteDefinition = {
  load({ params }) {
    void getProjectImages(params.projectId);
  },
};

export default function Media(props: RouteSectionProps) {
  const images = createAsync(() => getProjectImages(props.params.projectId));

  return (
    <main class="p-8 flex flex-col grow gap-8 max-w-2xl">
      <Title>Media - Volamail</Title>

      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">Media</h1>

        <p class="text-gray-600">
          In this page you can manage the media files stored for your project.
          <br />
          <br />
          The files are divided between images (that you can use in your emails)
          and attachments.
        </p>
      </div>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-medium">Images</h2>

        <Show
          when={images()?.length}
          fallback={
            <div class="p-4 rounded-lg bg-gray-100 text-center text-sm text-gray-500 border border-gray-300">
              No images added yet.
            </div>
          }
        >
          <ul class="flex flex-col gap-2">
            <For each={images()}>
              {(image) => (
                <li class="border flex flex-col gap-6 border-gray-300 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <div class="flex gap-2.5 items-center">
                    <Dialog>
                      <DialogTrigger>
                        <img
                          src={image.url}
                          alt={image.name}
                          class="size-12 rounded-lg object-cover"
                        />
                      </DialogTrigger>
                      <DialogContent class="p-0 overflow-hidden h-96 flex justify-center items-center ">
                        <img src={image.url} alt={image.name} />
                      </DialogContent>
                    </Dialog>

                    <div class="flex-grow">
                      <p class="font-medium">{image.name}</p>
                      <p class="text-xs text-gray-500">
                        {image.createdAt.toLocaleString("en-US")}
                      </p>
                    </div>

                    <div class="flex flex-col">
                      <EditMediaDialog
                        projectId={props.params.projectId}
                        media={image}
                      />
                      <DeleteImageDialog
                        projectId={props.params.projectId}
                        id={image.id}
                      />
                    </div>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Show>

        <AddImageDialog projectId={props.params.projectId} />
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-medium">Attachments</h2>

        <p class="text-gray-500 text-sm">Coming soon...</p>
      </section>
    </main>
  );
}
