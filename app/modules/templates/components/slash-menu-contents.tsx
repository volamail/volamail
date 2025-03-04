import { Button } from "@/modules/ui/components/button";
import { cn } from "@/modules/ui/utils/cn";
import type { Editor, Range } from "@tiptap/core";
import {
	Fragment,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from "react";

interface Props {
	items: Array<
		Array<{
			title: string;
			icon: React.ComponentType<{ className?: string }>;
			command: (options: { editor: Editor; range: Range }) => void;
		}>
	>;
	editor: Editor;
	range: Range;
}

interface SlashMenuContentsRef {
	keyDown: (event: KeyboardEvent) => boolean;
}

export const SlashMenuContents = forwardRef<SlashMenuContentsRef, Props>(
	function SlashMenuContents(props, ref) {
		const [highlighted, setHighlighted] = useState<[number, number]>([0, 0]);

		const itemsLength = useMemo(
			() => props.items.reduce((acc, item) => acc + item.length, 0),
			[props.items],
		);

		useImperativeHandle(ref, () => ({
			keyDown(event: KeyboardEvent) {
				if (event.key === "ArrowUp") {
					setHighlighted(([groupIndex, itemIndex]) => {
						if (!props.items[groupIndex][itemIndex - 1]) {
							if (groupIndex === 0) {
								return [
									props.items.length - 1,
									props.items[props.items.length - 1].length - 1,
								];
							}

							return [groupIndex - 1, props.items[groupIndex - 1].length - 1];
						}

						return [groupIndex, itemIndex - 1];
					});

					return true;
				}
				if (event.key === "ArrowDown") {
					setHighlighted(([groupIndex, itemIndex]) => {
						if (!props.items[groupIndex][itemIndex + 1]) {
							if (groupIndex === props.items.length - 1) {
								return [0, 0];
							}

							return [groupIndex + 1, 0];
						}

						return [groupIndex, itemIndex + 1];
					});

					return true;
				}

				if (event.key === "Enter") {
					const item = props.items[highlighted[0]][highlighted[1]];

					if (!item) {
						return false;
					}

					item.command(props);

					return true;
				}

				return false;
			},
		}));

		const items = useMemo(
			() =>
				props.items.map((group) =>
					group.map((item) => ({
						...item,
						id: Math.random(),
					})),
				),
			[props.items],
		);

		useEffect(() => {
			setHighlighted(([groupIndex, itemIndex]) => {
				if (props.items[groupIndex]?.[itemIndex]) {
					return [groupIndex, itemIndex];
				}

				return [0, 0];
			});
		}, [props.items]);

		return (
			<div className="flex flex-col gap-1 rounded-lg border p-1 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
				{itemsLength > 0 ? (
					items.map((group, groupIndex) => (
						<Fragment key={groupIndex}>
							{group.map((item, itemIndex) => (
								<Button
									variant="ghost"
									key={item.id}
									color="neutral"
									leading={<item.icon className="size-4 dark:text-gray-400" />}
									className={cn(
										"justify-start pr-4 font-normal dark:text-gray-50",
										highlighted[0] === groupIndex &&
											highlighted[1] === itemIndex
											? "dark:bg-gray-700 hover:dark:bg-gray-700"
											: "dark:hover:bg-gray-700",
									)}
									onClick={() => item.command(props)}
								>
									{item.title}
								</Button>
							))}
							<hr className="last:hidden dark:border-gray-700" />
						</Fragment>
					))
				) : (
					<span className="px-2 py-0.5 text-sm dark:text-gray-400">
						No commands found.
					</span>
				)}
			</div>
		);
	},
);
