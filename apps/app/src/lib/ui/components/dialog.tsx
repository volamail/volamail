import { XIcon } from "lucide-solid";
import { Show, splitProps } from "solid-js";
import * as DialogPrimitive from "@kobalte/core/dialog";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";

import { cn } from "../utils/cn";
import { Button } from "./button";

const DialogTrigger = DialogPrimitive.Trigger;

const Dialog: Component<
	DialogPrimitive.DialogRootProps & {
		preventClose?: boolean;
	}
> = (props) => {
	const [local, others] = splitProps(props, ["preventClose", "onOpenChange"]);

	function handleOpenChange(open: boolean) {
		if (local.preventClose) {
			return;
		}

		local.onOpenChange?.(open);
	}

	return <DialogPrimitive.Root {...others} onOpenChange={handleOpenChange} />;
};

const DialogPortal: Component<DialogPrimitive.DialogPortalProps> = (props) => {
	const [, rest] = splitProps(props, ["children"]);
	return (
		<DialogPrimitive.Portal {...rest}>
			<div class="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
				{props.children}
			</div>
		</DialogPrimitive.Portal>
	);
};

type DialogOverlayProps<T extends ValidComponent = "div"> =
	DialogPrimitive.DialogOverlayProps<T> & { class?: string | undefined };

const DialogOverlay = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogOverlayProps<T>>,
) => {
	const [, rest] = splitProps(props as DialogOverlayProps, ["class"]);
	return (
		<DialogPrimitive.Overlay
			class={cn(
				"fixed inset-0 z-50 bg-white/70 backdrop-blur-sm data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0",
				props.class,
			)}
			{...rest}
		/>
	);
};

type DialogContentProps<T extends ValidComponent = "div"> =
	DialogPrimitive.DialogContentProps<T> & {
		class?: string | undefined;
		children?: JSX.Element;
		hideCloseButton?: boolean;
	};

const DialogContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogContentProps<T>>,
) => {
	const [local, rest] = splitProps(props as DialogContentProps, [
		"class",
		"children",
		"hideCloseButton",
	]);

	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				class={cn(
					"fixed left-1/2 top-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-lg duration-200 data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] sm:rounded-2xl",
					props.class,
				)}
				{...rest}
			>
				{props.children}
				<Show when={!local.hideCloseButton}>
					<DialogPrimitive.CloseButton
						as={Button}
						class="absolute right-4 top-4 p-1"
						even
						rounded
						variant="ghost"
					>
						<XIcon class="size-4" />
						<span class="sr-only">Close</span>
					</DialogPrimitive.CloseButton>
				</Show>
			</DialogPrimitive.Content>
		</DialogPortal>
	);
};

const DialogHeader: Component<ComponentProps<"div">> = (props) => {
	const [, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn(
				"flex flex-col space-y-1.5 text-center sm:text-left",
				props.class,
			)}
			{...rest}
		/>
	);
};

const DialogFooter: Component<ComponentProps<"div">> = (props) => {
	const [, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				props.class,
			)}
			{...rest}
		/>
	);
};

type DialogTitleProps<T extends ValidComponent = "h2"> =
	DialogPrimitive.DialogTitleProps<T> & {
		class?: string | undefined;
	};

const DialogTitle = <T extends ValidComponent = "h2">(
	props: PolymorphicProps<T, DialogTitleProps<T>>,
) => {
	const [, rest] = splitProps(props as DialogTitleProps, ["class"]);
	return (
		<DialogPrimitive.Title
			class={cn(
				"text-lg font-semibold leading-none tracking-tight",
				props.class,
			)}
			{...rest}
		/>
	);
};

type DialogDescriptionProps<T extends ValidComponent = "p"> =
	DialogPrimitive.DialogDescriptionProps<T> & {
		class?: string | undefined;
	};

const DialogDescription = <T extends ValidComponent = "p">(
	props: PolymorphicProps<T, DialogDescriptionProps<T>>,
) => {
	const [, rest] = splitProps(props as DialogDescriptionProps, ["class"]);
	return (
		<DialogPrimitive.Description
			class={cn("text-sm text-gray-600", props.class)}
			{...rest}
		/>
	);
};

export {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
