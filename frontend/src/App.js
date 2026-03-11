import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./contexts/AppContext";
import { Header } from "./components/Header";
import Home from "./pages/Home";
import ScannerQR from "./pages/ScannerQR";
import ScannerBarcode from "./pages/ScannerBarcode";
import Historico from "./pages/Historico";
import Dashboard from "./pages/Dashboard";
import Materiais from "./pages/Materiais";
import GeradorQR from "./pages/GeradorQR";
import Atividade from "./pages/Atividade";
import Configuracoes from "./pages/Configuracoes";
import "./App.css";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scanner-qr" element={<ScannerQR />} />
              <Route path="/scanner-barcode" element={<ScannerBarcode />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/materiais" element={<Materiais />} />
              <Route path="/gerador-qr" element={<GeradorQR />} />
              <Route path="/atividade" element={<Atividade />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
