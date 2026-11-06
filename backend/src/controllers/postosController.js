import PostosService from "../services/postosService.js";

const postosService = new PostosService();

export const listarTodasAsFilas = async (req, res) => {
    postosService.ListarFilas();
}