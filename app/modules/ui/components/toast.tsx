import {
	AlertCircleIcon,
	CircleCheckIcon,
	InfoIcon,
	LoaderIcon,
	XIcon,
} from "lucide-react";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
	return (
		<SonnerToaster
			gap={8}
			icons={{
				success: <CircleCheckIcon className="size-4 text-green-500" />,
				info: <InfoIcon className="size-4 text-primary-600" />,
				close: <XIcon className="size-3" />,
				error: <AlertCircleIcon className="size-4 text-red-500" />,
				loading: <LoaderIcon className="size-4 animate-spin text-gray-500" />,
				warning: <AlertCircleIcon className="size-4 text-yellow-500" />,
			}}
			className="max-w-64"
			toastOptions={{
				unstyled: true,
				classNames: {
					icon: "mt-[0.1rem]",
					toast:
						"w-full flex gap-0.5 items-start shadow-2xl mx-auto shadow-black cursor-default rounded-lg px-3.5 py-2 text-xs border dark:bg-gray-800 dark:border-gray-700",
				},
			}}
		/>
	);
}
