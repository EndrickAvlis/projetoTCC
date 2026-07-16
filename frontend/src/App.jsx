import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AtendimentoProvider } from "./context/atendimentoContext";
import Login from "./pages/LoginPage";
import TriagemPage from "./pages/TriagemPage";
import ApmPage from "./pages/ApmPage";
import DocsPage from "./pages/DocsPage";
// Importe suas outras páginas (Admin, Secretaria, Painel TV)

function App() {
  return (
    <BrowserRouter>
      <AtendimentoProvider>
        <Routes>
          {/* Tela de Login */}
          <Route path="/" element={<Login />} />

          {/* Postos de Atendimento Fixo */}
          <Route path="/triagem" element={<TriagemPage />} />
          <Route path="/apm" element={<ApmPage />} />
          <Route path="/docs" element={<DocsPage />} />
          
          {/* Outras Telas do Sistema */}
          {/* <Route path="/secretaria" element={<SecretariaPage />} /> */}
          {/* <Route path="/admin" element={<AdminPage />} /> */}
          {/* <Route path="/painel" element={<PainelTvPage />} /> */}

          {/* Rota de Erro */}
          <Route
            path="*"
            element={
              <div style={{ padding: "20px", color: "red", fontSize: "20px" }}>
                O React Router está funcionando, mas não encontrou essa URL!
              </div>
            }
          />
        </Routes>
      </AtendimentoProvider>
    </BrowserRouter>
  );
}

export default App;