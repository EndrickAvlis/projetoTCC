import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select'; // ← Atenção: S maiúsculo
import { FaUser, FaLock } from 'react-icons/fa';

export default function Login() {
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');
    const [user, setUser] = useState(''); // ← mudar para funcao
    const [erro, setErro] = useState('');

    const users = [
        { value: 'admin', label: 'Administrador' },
        { value: 'secretaria', label: 'Secretaria' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'triagem', label: 'Triagem' },
        { value: 'apm', label: 'APM' },
        { value: 'docs', label: 'Docs' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // ← Usar funcao (não user)
        if (!username || !senha || !funcao) {
            setErro('Preencha todos os campos!');
            return;
        }

        if (username === 'admin' && senha === 'admin') {
            alert('Login ADMIN realizado!');
        } else {
            alert('Login realizado!');
        }
        setErro('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-white border border-border rounded-lg p-8 max-w-md w-full shadow-sm">
                <h1 className="text-title font-bold text-primary text-center mb-6">
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

                    <Select 
                        label="Função"
                        placeholder="Selecione a sua função..."
                        options={users}
                        value={user} 
                        onChange={(e) => setUser(e.target.value)}
                        required
                    />

                    <Button type="submit" className="w-full mt-2">
                        Entrar
                    </Button>
                </form>

            </div>
        </div>
    );
}