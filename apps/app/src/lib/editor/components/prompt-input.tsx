import { ComponentProps, Show } from "solid-js";
import { Textarea } from "~/lib/ui/components/textarea";
import { ImagePicker } from "./image-picker";
import { Button } from "~/lib/ui/components/button";
import { SparklesIcon } from "lucide-solid";

type Props = {
  loading?: boolean;
  projectId: string;
  selectedImageUrl?: string;
  onSelectImage: (imageUrl?: string) => void;
  ref?: HTMLTextAreaElement;
};

export function PromptInput(props: Props) {
  return (
    <Textarea
      name="prompt"
      required
      loading={props.loading}
      resizeable
      submitOnEnter
      autofocus
      ref={props.ref}
      leading={() => (
        <div class="flex gap-1 shrink-0 items-center py-1">
          <ImagePicker
            projectId={props.projectId}
            onSelect={props.onSelectImage}
          />
          <Show when={props.selectedImageUrl}>
            <span class="text-gray-500 text-sm">Using this image,</span>
            <input type="hidden" name="image" value={props.selectedImageUrl} />
          </Show>
        </div>
      )}
      trailing={() => (
        <Button
          type="submit"
          aria-label="Request changes"
          class="p-1.5 mt-0.5"
          round
          even
          icon={() => <SparklesIcon class="size-4" />}
        />
      )}
      class="py-1 gap-1"
      placeholder={
        props.selectedImageUrl
          ? "create an invite email and put the image on top."
          : "A welcome e-mail with a magic link button..."
      }
    />
  );
}
