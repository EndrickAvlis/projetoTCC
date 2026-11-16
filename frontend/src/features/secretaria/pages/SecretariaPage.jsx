import * as React from "react";
import { FiLogOut, FiBox, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import Card from "../../../components/ui/Card";
import Tabs from "../../../components/ui/Tabs";
import Button from "../../../components/ui/Button";
import SecaoRetiradas from "../components/SecaoRetiradas";
import SecaoVenda from "../components/SecaoVenda";
import { obterKpis } from "../services/secretariaService";

const ITENS_ABA = [
  { id: "retiradas", label: "Retiradas Pendentes", icone: FiBox },
  { id: "venda", label: "Venda Avulsa", icone: FiShoppingBag },
];

const KPIS_INICIAIS = {
  comprasPendentes: 0,
  itensPendentes: 0,
};

const SecretariaPage = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [abaAtiva, setAbaAtiva] = React.useState("retiradas");
  const [kpis, setKpis] = React.useState(KPIS_INICIAIS);
  const [carregandoKpis, setCarregandoKpis] = React.useState(true);

  const carregarKpis = React.useCallback(async () => {
    try {
      setCarregandoKpis(true);
      const res = await obterKpis();
      setKpis({
        comprasPendentes: res?.comprasPendentes ?? 0,
        itensPendentes: res?.itensPendentes ?? 0,
      });
    } catch {
      setKpis(KPIS_INICIAIS);
    } finally {
      setCarregandoKpis(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(carregarKpis);
  }, [carregarKpis]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const abasComBadge = ITENS_ABA.map((item) =>
    item.id === "retiradas"
      ? {
          ...item,
          badge: kpis.comprasPendentes > 0 ? kpis.comprasPendentes : undefined,
        }
      : item,
  );

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <header className="sticky top-0 z-20 bg-primary text-text-inverse px-6 py-2.5 shadow-xs">
        <div className="grid grid-cols-3 items-center min-h-14 gap-4">
          <div className="flex items-center justify-start">
            <p className="text-sm font-semibold text-text-inverse leading-tight truncate">
              Atendente: {usuario?.nome || "Usuário"}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-xl font-bold text-text-inverse leading-tight">
              Secretaria
            </h1>
            <p className="text-xs font-medium text-primary-text-muted mt-0.5">
              Retiradas e Vendas Avulsas
            </p>
          </div>

          <div className="flex items-center justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleLogout}
              leftIcon={<FiLogOut />}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            titulo="Compras Pendentes"
            icone={FiBox}
            bordaLateral="warning"
          >
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                {carregandoKpis ? "—" : kpis.comprasPendentes}
              </span>
              <p className="text-xs text-text-secondary mt-1">
                Compras aguardando retirada parcial ou total
              </p>
            </div>
          </Card>

          <Card
            titulo="Itens a Retirar"
            icone={FiShoppingBag}
            bordaLateral="primary"
          >
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-primary tracking-tight">
                {carregandoKpis ? "—" : kpis.itensPendentes}
              </span>
              <p className="text-xs text-text-secondary mt-1">
                Peças de uniforme aguardando entrega física
              </p>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Tabs
            itens={abasComBadge}
            ativo={abaAtiva}
            onSelecionar={setAbaAtiva}
            ariaLabel="Abas da Secretaria"
          />

          {abaAtiva === "retiradas" && (
            <SecaoRetiradas onRetiradaRegistrada={carregarKpis} />
          )}

          {abaAtiva === "venda" && (
            <SecaoVenda onVendaRealizada={carregarKpis} />
          )}
        </div>
      </main>
    </div>
  );
};

export default SecretariaPage;
