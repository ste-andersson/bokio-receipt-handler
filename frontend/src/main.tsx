import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import StartPage from "./StartPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <StartPage />
  </StrictMode>,
);
