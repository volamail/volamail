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
				"size-8 overflow-hidden bg-gray-800 border dark:border-gray-600 rounded-lg flex justify-center items-center",
				props.className,
			)}
		>
			<ArkAvatar.Fallback>{props.fallback}</ArkAvatar.Fallback>
			{props.src && <ArkAvatar.Image src={props.src} alt={props.alt} />}
		</ArkAvatar.Root>
	);
}
