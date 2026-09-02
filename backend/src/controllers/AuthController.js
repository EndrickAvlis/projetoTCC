import AuthService from "../services/AuthService.js";

const authService = new AuthService();

export const login = async (req, res, next) => {
    try{
        const token = await authService.login(req.validado.body);

        res.cookie('accessToken', token.accessToken, {
                path: "/",
                httpOnly: true,     // Impede acesso via JavaScript (document.cookie)
                secure: true,       // Exige HTTPS (mantenha como true em produção)
                sameSite: 'strict', // Protege contra ataques CSRF
                maxAge: 15 * 60 * 1000     // Tempo de vida: 15 minutos (em milissegundos)
            });

        res.cookie('refreshToken', token.refreshToken, {
                path: "/",
                httpOnly: true,     // Impede acesso via JavaScript (document.cookie)
                secure: true,       // Exige HTTPS (mantenha como true em produção)
                sameSite: 'strict', // Protege contra ataques CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000     // Tempo de vida: 7 dias (em milissegundos)
            });

        res.status(201).send();
    } catch (erro){
        return next(erro);
    }
}

export const renovarAccessToken = async (req, res, next) => {
    try{
        const token = await authService.renovarAccessToken(req.cookie.refreshToken);

        res.cookie('accessToken', token.accessToken, {
                path: "/",
                httpOnly: true,     // Impede acesso via JavaScript (document.cookie)
                secure: true,       // Exige HTTPS (mantenha como true em produção)
                sameSite: 'strict', // Protege contra ataques CSRF
                maxAge: 15 * 60 * 1000     // Tempo de vida: 15 minutos (em milissegundos)
        })

        res.status(201).send();
    }catch (erro){
        return next(erro)
    }
}

export const logout = async (req, res, next) => {
    res.clearCookie('accessToken', {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });
    res.clearCookie('refreshToken', {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });

    res.status(200).send();
}