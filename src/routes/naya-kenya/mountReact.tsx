import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import App from "./src/App";
import "./src/index.css";

let root: Root | null = null;

export function mountReactApp(container: HTMLElement) {
  if (!container) return;
  if (!root) {
    root = createRoot(container);
  }

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

export function unmountReactApp() {
  root?.unmount();
  root = null;
}
