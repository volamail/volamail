import { Dialog, Portal } from "@ark-ui/react";
import { XIcon } from "lucide-react";
import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";
import { cn } from "../utils/cn";
import { ActionButton } from "./action-button";

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogCloseTrigger = Dialog.CloseTrigger;

interface DialogContentProps
	extends Omit<ComponentProps<typeof Dialog.Content>, "title"> {
	title: ReactNode;
}

export function DialogContent(props: DialogContentProps) {
	const { title, className, ...rest } = props;

	return (
		<Portal>
			<Dialog.Backdrop className="data-[state=closed]:fade-out data-[state=open]:fade-in fixed inset-0 z-10 bg-black/50 backdrop-blur data-[state=closed]:animate-out data-[state=open]:animate-in" />

			<Dialog.Positioner className="fixed top-0 left-0 z-10 flex h-dvh w-screen items-center justify-center">
				<Dialog.Content
					{...rest}
					className={cn(
						"data-[state=open]:fade-in data-[state=open]:zoom-in-105 data-[state=closed]:fade-out data-[state=closed]:slide-out-to-bottom-1 relative z-10 w-full max-w-md rounded-xl border p-6 data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-gray-700 dark:bg-gray-900",
						className,
					)}
				>
					<div className="flex flex-col gap-1">
						<Dialog.CloseTrigger className="absolute top-4 right-4" asChild>
							<ActionButton color="neutral" padding="sm" variant="ghost">
								<XIcon className="size-4" />
							</ActionButton>
						</Dialog.CloseTrigger>
						<Dialog.Title className="font-medium text-lg dark:text-gray-50">
							{props.title}
						</Dialog.Title>
						{props.children}
					</div>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	);
}

export function useImperativeDialog<T>() {
	const [dynamicProps, setDynamicProps] = useState<T | null>(null);

	const props = useMemo(() => {
		return {
			open: dynamicProps !== null,
			dynamicProps: dynamicProps,
			onClose: () => setDynamicProps(null),
		};
	}, [dynamicProps]);

	const open = useCallback(
		(initialProps: T) => setDynamicProps(initialProps),
		[],
	);

	const close = useCallback(() => setDynamicProps(null), []);

	return {
		open,
		close,
		props,
	};
}

export type ImperativeDialogProps<T = never> = {
	dynamicProps: T | null;
	onClose: () => void;
};
