import { TipoVoluntario } from "@prisma/client";
import VoluntarioService from "../services/VoluntarioService.js";
import * as ValidadorVoluntario from "../validators/ValidatorVoluntario.js";
const voluntarioService = new VoluntarioService();


export const listarVoluntarios = async (req, res) => {
    const requisicao = {
            idVoluntario: req.query.idVoluntario,
            nomeVoluntario: req.query.nomeVoluntario,
            tipoVoluntario: req.query.tipoVoluntario,
            statusVoluntario: req.query.statusVoluntario,
    }

    const busca = ValidadorVoluntario.buscarVoluntarioSchema.safeParse(requisicao);

    if(!busca.success){
        return res.status(400).json(busca.error.issues);
    }
    
    res.status(200).json({
        mensagem: await voluntarioService.listar(busca.data)
    })
}

export const criarVoluntario = async (req, res) => {
    const dados = ValidadorVoluntario.criarVoluntarioSchema.safeParse(req.body);
    if(!dados.success){
        return res.status(400).json(dados.error.issues);
    }

        res.status(201).json({
        mensagem: await voluntarioService.criar(dados.data)
    })
}

export const atualizarVoluntario = async (req, res) => {
    const atualizacao = ValidadorVoluntario.atualizarVoluntarioSchema.safeParse(req.body);
    if(!atualizacao.success){
        return res.status(400).json(atualizacao.error.issues);
    }
    const id = Number(req.params.idVoluntario);

    res.status(202).json({
        mensagem: await voluntarioService.atualizar(id, atualizacao.data)
    })
}