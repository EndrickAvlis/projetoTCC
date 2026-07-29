// Configura os contextos globais e as rotas principais do frontend.
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AtendimentoProvider } from "./context/atendimentoContext";
import { AuthProvider } from "./context/authContext";
import RotaProtegida from "./components/routing/RotaProtegida";
import LoginPage from "./pages/LoginPage";
import TriagemPage from "./pages/TriagemPage";
import ApmPage from "./pages/ApmPage";
import DocsPage from "./pages/DocsPage";
import AcessoNegadoPage from "./pages/AcessoNegadoPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AtendimentoProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/triagem"
              element={<TriagemPage />}
            />
            <Route
              path="/apm"
              element={<ApmPage />}
            />
            <Route
              path="/docs"
              element={<DocsPage />}
            />
            {/* <Route
              path="/admin"
              element={<RotaProtegida tela="admin"><TelaEmConstrucaoPage titulo="Administração" /></RotaProtegida>}
            />
            <Route
              path="/secretaria"
              element={<RotaProtegida tela="secretaria"><TelaEmConstrucaoPage titulo="Secretaria" /></RotaProtegida>}
            /> */}
            <Route path="/acesso-negado" element={<AcessoNegadoPage />} />
            <Route
              path="*"
              element={<div style={{ padding: "20px", color: "red", fontSize: "20px" }}>Página não encontrada.</div>}
            />
          </Routes>
        </AtendimentoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
