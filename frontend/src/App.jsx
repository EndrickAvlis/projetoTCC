import * as ReactRouter from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { AtendimentoProvider } from "./features/postos/context/atendimentoContext";
import RotaProtegida from "./components/routing/RotaProtegida";
import LoginPage from "./pages/loginPage";
import TriagemPage from "./features/postos/pages/triagemPage";
import ApmPage from "./features/postos/pages/apmPage";
import DocsPage from "./features/postos/pages/docsPage";
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
    <ReactRouter.BrowserRouter>
      <AuthProvider>
        <ReactRouter.Routes>
          {/* 1. Rotas Públicas */}
          <ReactRouter.Route path="/" element={<LoginPage />} />
          <ReactRouter.Route
            path="/emitir-senha"
            element={<EmitirSenhaPage />}
          />
          <ReactRouter.Route
            path="/acesso-negado"
            element={<AcessoNegadoPage />}
          />

          <ReactRouter.Route element={<RotaProtegida />}>
            <ReactRouter.Route
              element={
                <AtendimentoProvider>
                  <ReactRouter.Outlet />
                </AtendimentoProvider>
              }
            >
              <ReactRouter.Route element={<RotaProtegida tela="triagem" />}>
                <ReactRouter.Route path="/triagem" element={<TriagemPage />} />
              </ReactRouter.Route>

              <ReactRouter.Route element={<RotaProtegida tela="apm" />}>
                <ReactRouter.Route path="/apm" element={<ApmPage />} />
              </ReactRouter.Route>
              
              <ReactRouter.Route element={<RotaProtegida tela="docs" />}>
                <ReactRouter.Route path="/docs" element={<DocsPage />} />
              </ReactRouter.Route>
            </ReactRouter.Route>

            <ReactRouter.Route element={<RotaProtegida tela="admin" />}>
              <ReactRouter.Route path="admin" element={<AdminLayout />}>
                <ReactRouter.Route index element={<ReactRouter.Navigate to="dashboard" replace />} />
                <ReactRouter.Route path="dashboard" element={<DashboardPage />} />
                <ReactRouter.Route path="filas" element={<FilasPage />} />
                <ReactRouter.Route path="alunos" element={<AlunosPage />} />
                <ReactRouter.Route path="cursos" element={<CursosPage />} />
                <ReactRouter.Route path="produtos" element={<ProdutosPage />} />
                <ReactRouter.Route path="relatorios" element={<RelatoriosPage />} />
                <ReactRouter.Route path="usuarios" element={<UsuariosPage />} />
                <ReactRouter.Route path="configuracoes" element={<ConfiguracoesPage />} />
              </ReactRouter.Route>
            </ReactRouter.Route>
          </ReactRouter.Route>

          <ReactRouter.Route
            path="*"
            element={
              <div className="p-5 text-xl text-status-danger">
                Página não encontrada.
              </div>
            }
          />
        </ReactRouter.Routes>
      </AuthProvider>
    </ReactRouter.BrowserRouter>
  );
}

export default App;
