import Login from "./pages/loginPage";
import TriagemPage from "./pages/triagemPage";
import ApmPage from "./pages/apmPage";
import DocsPage from "./pages/docsPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/triagem" element={<TriagemPage />} />
        <Route path="/apm" element={<ApmPage />} />
        <Route path="/docs" element={<DocsPage />} />
        
        {/* ROTA DE TESTE CERTEIRA */}
        <Route path="*" element={<div style={{padding: '20px', color: 'red', fontSize: '20px'}}>O React Router está funcionando, mas não encontrou essa URL!</div>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
