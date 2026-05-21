import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PrivacyProvider } from "./context/PrivacyContext";
import { NotificacoesProvider } from "./context/NotificacoesContext";
import { SeubolsoProvider } from "./context/SeubolsoContext";
import { InteresseProvider } from "./context/InteresseContext";
import { RecomendacoesProvider } from "./context/RecomendacoesContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivacyProvider>
      <NotificacoesProvider>
        <SeubolsoProvider>
          <InteresseProvider>
            <RecomendacoesProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </RecomendacoesProvider>
          </InteresseProvider>
        </SeubolsoProvider>
      </NotificacoesProvider>
    </PrivacyProvider>
  </React.StrictMode>
);
