import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Toaster } from "@/modules/ui/components/toast";
import { NotFound } from "../modules/ui/components/not-found";
import globalCss from "./global.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Volamail",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: globalCss,
			},
		],
		// Hack to get HMR to work https://github.com/TanStack/router/issues/1992
		// 		scripts: import.meta.env.DEV
		// 			? [
		// 					{
		// 						type: "module",
		// 						children: `import RefreshRuntime from "/_build/@react-refresh";
		// RefreshRuntime.injectIntoGlobalHook(window)
		// window.$RefreshReg$ = () => {}
		// window.$RefreshSig$ = () => (type) => type`,
		// 					},
		// 				]
		// 			: [],
	}),
	notFoundComponent: NotFound,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
			<Toaster />
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div id="banner-container" />
				{children}
				<Scripts />
			</body>
		</html>
	);
}
