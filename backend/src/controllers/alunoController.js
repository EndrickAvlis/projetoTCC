import AlunoService from "../services/alunoService.js";
import { mapearAluno } from "../mappers/alunoMapper.js";

const alunoService = new AlunoService();

export const listarAlunos = async (req, res) => {
  const resultado = await alunoService.listarAlunos(req.validado.query);

  return res.json({
    alunos: resultado.alunos.map(mapearAluno),
    total: resultado.total,
    pagina: resultado.pagina,
    limite: resultado.limite,
  });
};

export const listarCidades = async (req, res) => {
  const cidades = await alunoService.listarCidades();
  return res.json({ cidades });
};

export const atualizarAluno = async (req, res) => {
  const aluno = await alunoService.atualizarAluno(
    req.validado.params.id,
    req.validado.body,
  );

  return res.json({
    aluno: mapearAluno(aluno),
  });
};

export const importarAlunos = async (req, res) => {
  const resultado = await alunoService.importarAlunos(req.validado.body);

  return res.status(201).json(resultado);
};

export const arquivarCandidatos = async (req, res) => {
  const resultado = await alunoService.arquivarCandidatos(req.validado.body);

  return res.json(resultado);
};

export const excluirAluno = async (req, res) => {
  await alunoService.excluirAluno(req.validado.params.id);

  return res.status(204).send();
};

export const excluirAlunos = async (req, res) => {
  const resultado = await alunoService.excluirAlunos();

  return res.json(resultado);
};
