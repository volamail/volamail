import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { FileRoutes } from "@solidjs/start/router";

import "./global.css";

import { Toaster } from "./lib/ui/components/toasts";

export default function App() {
  return (
    <Router
      root={(props) => (
        <Suspense>
          <MetaProvider>
            {props.children}
            <Toaster />
          </MetaProvider>
        </Suspense>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
