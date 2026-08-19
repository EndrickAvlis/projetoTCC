import jwt from "jsonwebtoken";
import BaseService from "./BaseService";

export default class AuthClass extends BaseService {
    async realizarLogin(dados){
        const user = super.listar(where = { nomeVoluntario: dados.nomeVoluntario })

        if(!user){
            throw new Error("Credenciais inválidas");
        }

        
    }
}