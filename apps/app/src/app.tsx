import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

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
