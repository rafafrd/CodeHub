import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/600.css";
import "@fontsource/rajdhani/700.css";
import "@fontsource/share-tech-mono/400.css";

import { App } from "./App";
import { SettingsProvider } from "./theme/SettingsContext";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Elemento #root não encontrado no index.html");
}

createRoot(root).render(
  <StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
);
