import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { FileRoutes } from "@solidjs/start/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

import "./global.css";

import { Toaster } from "./lib/ui/components/toasts";

export default function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5000,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
