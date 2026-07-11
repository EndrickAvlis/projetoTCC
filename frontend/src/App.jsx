import Login from "./pages/LoginPage";
import TriagemPage from "./pages/TriagemPage";
import ApmPage from "./pages/ApmPage";
import DocsPage from "./pages/DocsPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AtendimentoProvider } from "./context/atendimentoContext";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/triagem"
          element={
            <AtendimentoProvider>
              <TriagemPage />
            </AtendimentoProvider>
          }
        />
        <Route path="/apm" element={<ApmPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* ROTA DE TESTE CERTEIRA */}
        <Route
          path="*"
          element={
            <div style={{ padding: "20px", color: "red", fontSize: "20px" }}>
              O React Router está funcionando, mas não encontrou essa URL!
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
