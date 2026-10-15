import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import BenchmarkApp from "../pages/benchmark/BenchmarkApp";
import "../index.css";

// Entry point isolado pro benchmark visual (feat/benchmark-visual) — não toca em
// src/main.tsx nem em src/App.tsx. Importa o mesmo index.css do app principal só pra herdar
// os tokens de design (cor da marca, radius, sombras, fonte Inter), sem redefinir nada.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BenchmarkApp />
    </BrowserRouter>
  </React.StrictMode>
);
