import AuthService from "../services/AuthService.js";

const authService = new AuthService();

export const realizarLogin = async (req, res, next) => {
    try{
        const token = await authService.realizarLogin(req.validado.body);

        return res.status(200).json(token);
    } catch (erro){
        return next(erro);
    }


}