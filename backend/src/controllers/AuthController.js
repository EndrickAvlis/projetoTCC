import AuthService from "../services/AuthService.js";

const authServiceVoluntario = new AuthService(voluntario, "idVoluntario");

export const realizarLogin = async (req, res) => {
    try{
        const token = await authServiceVoluntario.realizarLogin(req.body);    
    } catch (erro){
        res.status(400).json({"mensagem": erro});
    }


}