import AuthService from "../services/AuthService.js";

const authService = new AuthService();

export const login = async (req, res, next) => {
    try{
        const token = await authService.login(req.validado.body);

        return res.status(200).json(token);
    } catch (erro){
        return next(erro);
    }
}

export const renovarAccessToken = async (req, res, next) => {
    try{
        const token = await authService.renovarAccessToken(req.validado.body.token);

        return res.status(200).json(token);
    }catch (erro){
        return next(erro)
    }
}