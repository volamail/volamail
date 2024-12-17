import { Avatar as ArkAvatar } from "@ark-ui/react/avatar";
import { cn } from "../utils/cn";

interface AvatarProps {
	src?: string | null;
	fallback: string;
	alt?: string;
	className?: string;
}

export function Avatar(props: AvatarProps) {
	return (
		<ArkAvatar.Root
			className={cn(
				"flex size-8 items-center justify-center overflow-hidden rounded-lg border bg-gray-800 dark:border-gray-600",
				props.className,
			)}
		>
			<ArkAvatar.Fallback>{props.fallback}</ArkAvatar.Fallback>
			{props.src && <ArkAvatar.Image src={props.src} alt={props.alt} />}
		</ArkAvatar.Root>
	);
}
