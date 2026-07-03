import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select"; // ← Atenção: S maiúsculo
import { FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [funcao, setFuncao] = useState("");
  const [erro, setErro] = useState("");
  const [guiche, setGuiche] = useState("");

  const users = [
    { value: "admin", label: "Administrador" },
    { value: "secretaria", label: "Secretaria" },
    { value: "supervisor", label: "Supervisor" },
    { value: "triagem", label: "Triagem" },
    { value: "apm", label: "APM" },
    { value: "docs", label: "Docs" },
  ];

  const isDisabled = !username || !senha || !funcao || 
    (['triagem', 'apm', 'docs'].includes(funcao) && !guiche);


  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Usuário:", username);
    console.log("Senha:", senha);
    console.log("Função:", funcao);
    console.log("Guichê:", guiche);
    // Aqui você pode adicionar a lógica de autenticação, como enviar os dados para o backend e verificar as credenciais.
    // Se a autenticação for bem-sucedida, redirecione o usuário para a página principal.
    // Caso contrário, exiba uma mensagem de erro.
    
    setErro("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg    -background p-4">
      <div className="bg-white border border-border rounded-lg p-8 max-w-md w-full shadow-sm">
        <h1 className="text-body font-bold text-primary text-center mb-6">
          Entrar no sistema
        </h1>

        {erro && (
          <div className="bg-danger-bg text-danger-text border border-danger-text rounded-md px-4 py-2 text-sm mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome de usuário"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<FaUser className="text-primary" />}
            iconPosition="left"
            required
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            icon={<FaLock className="text-primary" />}
            iconPosition="left"
            required
          />

          <div className="flex gap-4 items-end">
            <Select
              label="Função"
              placeholder="Selecione a funcionalidade..."
              options={users}
              value={funcao}
              onChange={(e) => setFuncao(e.target.value)}
              required
              id="funcao"
              //error={!funcao && "Selecione uma função válida"}
            />

            {["triagem", "apm", "docs"].includes(funcao) && (
              <div className="max-w-37.5">
                <Input
                  label="Guichê"
                  type="text"
                  placeholder="Digite"
                  value={guiche}
                  onChange={(e) => setGuiche(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isDisabled}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
