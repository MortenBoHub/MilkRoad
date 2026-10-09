/**
 * Entry point: mount React into #root.
 *
 * `import.meta.hot.data` survives Bun's hot reload, so one root stays alive
 * across reloads instead of remounting the whole app on every change.
 * https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "@/hooks/useAuth";

const elem = document.getElementById("root")!;

(import.meta.hot.data.root ??= createRoot(elem)).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
