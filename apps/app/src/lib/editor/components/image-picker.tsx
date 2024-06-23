import {
  CheckIcon,
  ImageIcon,
  LoaderIcon,
  UploadCloudIcon,
} from "lucide-solid";
import { createAsync } from "@solidjs/router";
import { For, Show, Suspense, createSignal } from "solid-js";

import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "~/lib/ui/components/popover";
import { addImage } from "~/lib/media/actions";
import { Button } from "~/lib/ui/components/button";
import { getProjectImages } from "~/lib/media/queries";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";

type Props = {
  projectId: string;
  onSelect: (imageUrl?: string) => void;
};

export function ImagePicker(props: Props) {
  const images = createAsync(() => getProjectImages(props.projectId));

  const [open, setOpen] = createSignal(false);
  const [selectedImageId, setSelectedImageId] = createSignal<string>();

  const addImageAction = useMutation({
    action: addImage,
    onSuccess({ data }) {
      showToast({
        title: "Image uploaded",
        variant: "success",
      });

      // Give the user a bit of time to see the image
      setTimeout(() => {
        setSelectedImageId(data.id);

        props.onSelect(data.url);

        setOpen(false);
      }, 200);
    },
    onError(e) {
      console.log(e);
      showToast({
        title: "Unable to upload image",
        variant: "error",
      });
    },
  });

  function handleSelect(media: { id: string; url: string }) {
    setOpen(false);

    if (selectedImageId() === media.id) {
      setSelectedImageId();

      props.onSelect();

      return;
    }

    setSelectedImageId(media.id);

    props.onSelect(media.url);
  }

  return (
    <PopoverRoot placement="top" open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        as={Button}
        type="button"
        even
        variant="ghost"
        icon={() => <ImageIcon class="size-4" />}
        aria-label="Insert media"
        class="relative p-1"
      >
        <Show when={selectedImageId()}>
          <div class="absolute bottom-0.5 right-0.5 size-2 bg-blue-600 rounded-full" />
        </Show>
      </PopoverTrigger>
      <PopoverContent class="p-2 w-64">
        <div class="flex flex-col border rounded-lg border-gray-300 overflow-hidden">
          <form
            action={addImage}
            method="post"
            class="flex text-sm p-1 gap-2 items-center border-b border-gray-300 bg-white"
          >
            <input type="hidden" name="projectId" value={props.projectId} />
            <input
              type="file"
              name="file"
              required
              accept="image/png, image/jpeg"
              class="file:rounded-md file:border-0 file:hover:bg-gray-300 transition-colors rounded-md"
            />
            <Button
              type="submit"
              icon={() => <UploadCloudIcon class="size-4" />}
              aria-label="Add media"
              even
              variant="ghost"
              class="p-1"
              loading={addImageAction.pending}
            />
          </form>
          <ul class="relative flex flex-col w-full h-64 overflow-y-auto bg-gray-100">
            <Suspense
              fallback={<LoaderIcon class="size-4 animate-spin mx-auto my-4" />}
            >
              <Show
                when={images()?.length}
                fallback={
                  <p class="text-gray-500 text-sm my-2 text-center">
                    No media uploaded yet.
                  </p>
                }
              >
                <For each={images()}>
                  {(media) => (
                    <li class="flex justify-between items-center p-1 border-b gap-2 bg-white">
                      <button
                        class="relative border border-gray-300 size-12 rounded overflow-hidden shrink-0 hover:opacity-50 transition-opacity"
                        onClick={() => handleSelect(media)}
                      >
                        <img
                          src={media.url}
                          alt={media.name}
                          class="size-full object-cover"
                        />

                        <Show when={selectedImageId() === media.id}>
                          <div class="absolute inset-0 bg-white/70 flex justify-center items-center">
                            <CheckIcon class="size-6 text-blue-500" />
                          </div>
                        </Show>
                      </button>
                      <div class="flex flex-col overflow-hidden grow">
                        <p class="text-sm grow truncate break-all">
                          {media.name}
                        </p>
                        <p class="text-xs text-gray-500">{media.dimensions}</p>
                      </div>
                    </li>
                  )}
                </For>
              </Show>
            </Suspense>
          </ul>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
