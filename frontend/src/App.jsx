// Configura os contextos globais e as rotas principais do frontend.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AtendimentoProvider } from "./context/atendimentoContext";
import { AuthProvider } from "./context/authContext";
import RotaProtegida from "./components/routing/RotaProtegida";
import LoginPage from "./pages/LoginPage";
import TriagemPage from "./pages/TriagemPage";
import ApmPage from "./pages/ApmPage";
import DocsPage from "./pages/DocsPage";
import AcessoNegadoPage from "./pages/AcessoNegadoPage";
import EmitirSenhaPage from "./pages/EmitirSenhaPage";
import AdminLayout from "./features/admin/layout/adminLayout";
import DashboardPage from "./features/admin/pages/dashboardPage";
import FilasPage from "./features/admin/pages/filasPage";
import AlunosPage from "./features/admin/pages/alunosPage";
import CursosPage from "./features/admin/pages/cursosPage";
import ProdutosPage from "./features/admin/pages/produtosPage";
import RelatoriosPage from "./features/admin/pages/relatoriosPage";
import UsuariosPage from "./features/admin/pages/usuariosPage";
import ConfiguracoesPage from "./features/admin/pages/configuracoesPage";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AtendimentoProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/triagem" element={<TriagemPage />} />
            <Route path="/apm" element={<ApmPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/emitir-senha" element={<EmitirSenhaPage />} />
            <Route path="/acesso-negado" element={<AcessoNegadoPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="filas" element={<FilasPage />} />
              <Route path="alunos" element={<AlunosPage />} />
              <Route path="cursos" element={<CursosPage />} />
              <Route path="produtos" element={<ProdutosPage />} />
              <Route path="relatorios" element={<RelatoriosPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="configuracoes" element={<ConfiguracoesPage />} />
            </Route>
            <Route
              path="*"
              element={
                <div
                  className="p-5 text-xl text-status-danger"
                >
                  Página não encontrada.
                </div>
              }
            />
          </Routes>
        </AtendimentoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
