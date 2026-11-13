import SenhaService from "../services/senhaService.js";
import HistoricoSenhaService from "../services/historicoSenhaService.js";
import AlunoService from "../services/alunoService.js";
import { mapearAluno } from "../mappers/alunoMapper.js";
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";

const senhaService = new SenhaService();
const historicoSenhaService = new HistoricoSenhaService();
const alunoService = new AlunoService();

export const iniciarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const etapaUsuario = req.usuario.tela;
  const idSenha = req.validado.body.senhaId;

  const senha = await senhaService.buscarPorId(idSenha);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  if (senha.statusSenha !== "chamada") {
    throw new AppError(
      "A senha precisa estar com o status chamada para que o atendimento seja iniciado.",
      {
        status: 400,
        code: "SENHA_NAO_CHAMADA",
      },
    );
  }

  if (senha.etapaSenha !== etapaUsuario) {
    throw etapasDiferentes();
  }

  const atendimentoAberto =
    await historicoSenhaService.listarAtendimentoAbertoComSenha(
      idUsuario,
      senha.idSenha,
      senha.etapaSenha,
    );

  if (!atendimentoAberto) {
    throw atendimentoAbertoError();
  }

  const agora = new Date();

  await senhaService.atualizar(senha.idSenha, {
    statusSenha: "em_atendimento",
  });

  await historicoSenhaService.atualizar(atendimentoAberto.idHistorico, {
    dataHoraInicioHistorico: agora,
  });

  let alunoResposta = null;

  if (senha.etapaSenha !== "triagem") {
    if (!senha.codAluno) {
      throw alunoNaoCadastrado();
    }

    const aluno = await alunoService.buscarPorId(senha.codAluno, {
      include: {
        cursosAluno: {
          include: {
            curso: true,
          },
        },
      },
    });

    alunoResposta = mapearAluno(aluno);
  }

  res.status(201).json({
    mensagem: "Atendimento iniciado com sucesso.",
    atendimento: {
      idHistorico: atendimentoAberto.idHistorico,
      iniciadoEm: agora,
    },
    aluno: alunoResposta,
  });
};

export const recuperarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const etapa = req.validado?.params?.etapa ?? req.usuario.tela;

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAberto(
    idUsuario,
    etapa,
  );

  if (!atendimentoAberto) {
    return res.status(200).json({
      senha: null,
      atendimento: null,
    });
  }

  const senha = await senhaService.buscarPorId(atendimentoAberto.codSenha);

  let alunoResposta = null;

  if (senha.codAluno) {
    const aluno = await alunoService.buscarPorId(senha.codAluno, {
      include: {
        cursosAluno: {
          include: {
            curso: true,
          },
        },
      },
    });

    alunoResposta = mapearAluno(aluno);
  }

  res.status(200).json({
    senha: {
      id: senha.idSenha,
      codigo: senha.senhaCodigo,
      prioritaria: senha.tipoSenha,
      etapa: senha.etapaSenha,
      status: senha.statusSenha,
      aluno: alunoResposta,
    },
    atendimento: {
      idHistorico: atendimentoAberto.idHistorico,
      iniciadoEm: atendimentoAberto.dataHoraInicioHistorico,
    },
  });
};

export const finalizarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idSenha = req.validado.body.senhaId;

  const resultado = await prisma.$transaction(async (transacao) => {
    const senha = await transacao.senha.findUnique({
      where: { idSenha },
    });

    if (!senha) throw senhaNaoEncontrada();
    if (senha.statusSenha !== "em_atendimento") throw senhaNaoEmAtendimento();

    if (senha.etapaSenha === "triagem" && !senha.codAluno) {
      throw new AppError(
        "Vincule um aluno à senha antes de finalizar a triagem.",
        {
          status: 409,
          code: "ALUNO_NAO_VINCULADO",
        },
      );
    }

    const atendimento = await transacao.historicoSenha.findFirst({
      where: {
        codSenha: idSenha,
        codVoluntario: idUsuario,
        etapaHistorico: senha.etapaSenha,
        dataHoraFimHistorico: null,
      },
    });

    if (!atendimento) throw atendimentoNaoEncontrado();

    const agora = new Date();
    const proximaEtapa = senha.etapaSenha === "triagem" ? "apm" : "docs";
    const finalizada = senha.etapaSenha === "docs";

    await transacao.historicoSenha.update({
      where: { idHistorico: atendimento.idHistorico },
      data: { dataHoraFimHistorico: agora },
    });

    await transacao.senha.update({
      where: { idSenha },
      data: {
        etapaSenha: proximaEtapa,
        statusSenha: finalizada ? "finalizada" : "aguardando",
        dataHoraFimSenha: finalizada ? agora : null,
        ...(senha.etapaSenha === "triagem"
          ? { documentosPendentes: { documentos: [] } }
          : {}),
      },
    });

    if (finalizada && senha.codAluno) {
      await transacao.aluno.update({
        where: { idAluno: senha.codAluno },
        data: { statusAluno: "ATIVO" },
      });

      await transacao.cursoAluno.updateMany({
        where: { codAluno: senha.codAluno },
        data: { statusMatricula: "ATIVA" },
      });
    }

    return {
      mensagem: "Atendimento finalizado com sucesso.",
      proximaEtapa: finalizada ? "docs" : proximaEtapa,
    };
  });

  return res.status(200).json(resultado);
};

export const cancelarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idSenha = req.validado.body.senhaId;
  const agora = new Date();

  const senha = await senhaService.buscarPorId(idSenha);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  if (
    senha.statusSenha !== "chamada" &&
    senha.statusSenha !== "em_atendimento"
  ) {
    throw new AppError(
      "Apenas senhas chamadas ou em atendimento podem ser canceladas.",
      {
        status: 400,
        code: "STATUS_INVALIDO",
      },
    );
  }

  const atendimentoAberto =
    await historicoSenhaService.listarAtendimentoAbertoComSenha(
      idUsuario,
      senha.idSenha,
      senha.etapaSenha,
    );

  if (atendimentoAberto) {
    await historicoSenhaService.atualizar(atendimentoAberto.idHistorico, {
      dataHoraFimHistorico: agora,
    });
  }

  await senhaService.atualizar(senha.idSenha, {
    statusSenha: "cancelada",
    dataHoraFimSenha: agora,
  });

  res.status(200).json({
    mensagem: "Atendimento cancelado com sucesso",
  });
};

const senhaNaoEncontrada = () =>
  new AppError("Senha não encontrada.", {
    status: 404,
    code: "SENHA_NAO_ENCONTRADA",
  });

const senhaNaoEmAtendimento = () =>
  new AppError("Senha aguardando ou finalizada", {
    status: 400,
    code: "SENHA_NAO_ATENDIMENTO",
  });

const etapasDiferentes = () =>
  new AppError("A senha e o usuario estão em etapas diferentes", {
    status: 403,
    code: "ETAPAS_DIFERENTES",
  });

const usuarioNaoEncontrado = () =>
  new AppError("Usuário não encontrado.", {
    status: 404,
    code: "USUARIO_NAO_ENCONTRADO",
  });

const atendimentoNaoEncontrado = () =>
  new AppError("Nenhum atendimento aberto com essa senha nessa etapa", {
    status: 404,
    code: "ATENDIMENTO_NAO_ENCONTRADO",
  });

const atendimentoAbertoError = () =>
  new AppError("Usuário com atendimento aberto nessa etapa", {
    status: 409,
    code: "ATENDIMENTO_ABERTO",
  });

const alunoNaoCadastrado = () =>
  new AppError("Aluno não cadastrado na senha atual", {
    status: 404,
    code: "ALUNO_NAO_CADASTRADO",
  });
