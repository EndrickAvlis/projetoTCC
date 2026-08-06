import VoluntarioService from "../services/VoluntarioService.js";
const voluntarioService = new VoluntarioService();

export const listarVoluntarios = async (req, res) => {
    res.status(200).json({
        mensagem: await voluntarioService.listar()
    })
}