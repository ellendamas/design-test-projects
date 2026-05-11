import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PrivacyProvider } from "./context/PrivacyContext";
import { NotificacoesProvider } from "./context/NotificacoesContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivacyProvider>
      <NotificacoesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificacoesProvider>
    </PrivacyProvider>
  </React.StrictMode>
);
