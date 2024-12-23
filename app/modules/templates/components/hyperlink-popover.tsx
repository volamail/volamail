import { ActionButton } from "@/modules/ui/components/action-button";
import { TextInput } from "@/modules/ui/components/text-input";
import {
	PopoverContent,
	PopoverPositioner,
	PopoverRoot,
	PopoverTrigger,
	Portal,
} from "@ark-ui/react";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface Props {
	trigger: React.ReactNode;
	onSet: (value: string) => void;
	onUnset: () => void;
}

export function HyperlinkPopover(props: Props) {
	const [value, setValue] = useState("");
	const [open, setOpen] = useState(false);

	function handleSet() {
		setOpen(false);

		if (value.trim()) {
			props.onSet(value);
		}
	}

	function handleUnset() {
		setOpen(false);

		props.onUnset();
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		setValue(e.target.value);
	}

	return (
		<PopoverRoot
			lazyMount
			unmountOnExit
			open={open}
			onOpenChange={({ open }) => setOpen(open)}
			positioning={{
				offset: {
					mainAxis: 6,
					crossAxis: 0,
				},
			}}
		>
			<PopoverTrigger asChild>{props.trigger}</PopoverTrigger>
			<Portal>
				<PopoverPositioner>
					<PopoverContent className="rounded-lg p-1.5 dark:bg-gray-900">
						<div className="flex gap-1">
							<TextInput
								defaultValue={value}
								onChange={handleInputChange}
								placeholder="https://"
								className="px-1.5 py-0.5"
							/>

							<ActionButton
								variant="ghost"
								color="neutral"
								onClick={handleSet}
								className="p-1.5"
							>
								<CheckIcon className="size-4" />
							</ActionButton>

							<ActionButton
								variant="ghost"
								color="red"
								onClick={handleUnset}
								className="p-1.5"
							>
								<XIcon className="size-4" />
							</ActionButton>
						</div>
					</PopoverContent>
				</PopoverPositioner>
			</Portal>
		</PopoverRoot>
	);
}
