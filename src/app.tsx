// @refresh reload

import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { FileRoutes } from "@solidjs/start/router";

import "./global.css";
import { Toaster } from "~/lib/ui/components/toasts";

export default function App() {
	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<Suspense>{props.children}</Suspense>
					<Toaster />
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
