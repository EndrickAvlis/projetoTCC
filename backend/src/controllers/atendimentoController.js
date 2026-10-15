import SenhaService from "../services/senhaService.js";
import HistoricoSenhaService from "../services/historicoSenhaService.js";
import AppError from "../errors/AppError.js";
import { exactOptional } from "zod";

const senhaService = new SenhaService();
const historicoSenhaService = new HistoricoSenhaService();

const senhaNaoEncontrada = () =>
  new AppError("Senha não encontrada.", {
    status: 404,
    code: "SENHA_NAO_ENCONTRADA",
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


export const iniciarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idSenha = req.validado.params.id;

  const senha = await senhaService.buscarPorId(idSenha);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  const agora = new Date();

  const novoHistoricoDeSenha = await historicoSenhaService.criar({
    codSenha: senha.idSenha,
    codVoluntario: idUsuario,
    etapaHistorico: senha.etapaSenha,
    dataHoraInicioHistorico: agora
  });

  const senhaAtualizada = await senhaService.atualizar(senha.idSenha, {
    statusSenha: "em_atendimento",
  });

  res.status(201).send();
}

export const recuperarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const etapa = req.validado.params.etapa;

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAberto(idUsuario, etapa)

  res.status(200).json(atendimentoAberto);
}

export const finalizarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idSenha = req.validado.params.id;

  const senha = await senhaService.buscarPorId(idSenha);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAberto(idUsuario, senha.idSenha, senha.etapaSenha);

  const agora = new Date();

  if (!atendimentoAberto) {
    historicoSenhaService.criar({
      codSenha: senha.idSenha,
      codVoluntario: idUsuario,
      etapaHistorico: senha.etapaSenha,
      dataHoraInicioHistorico: agora,
      dataHoraFimHistorico: agora
    });
  } else {
      historicoSenhaService.atualizar(atendimentoAberto.idHistorico,
      {
        dataHoraFimHistorico: agora
      },
    )
  }

  await senhaService.avancarEtapa(senha.idSenha, senha.etapaSenha);

  res.status(200).send();
}

export const cancelarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idSenha = req.validado.params.id;
  const agora = new Date();

  const senha = await senhaService.buscarPorId(idSenha);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAberto(idUsuario, senha.idSenha, senha.etapaSenha);

  if (!atendimentoAberto) {
    throw atendimentoNaoEncontrado();
  }

  console.log(atendimentoAberto)

  await historicoSenhaService.atualizar(atendimentoAberto.idHistorico,
    {
      dataHoraFimHistorico: agora
    }
  );

  const atendimentoDepois = await historicoSenhaService.buscarPorId(atendimentoAberto.idHistorico);

  console.log(atendimentoDepois)

  await senhaService.atualizar(senha.idSenha, 
    {
      statusSenha: "cancelada"
    }
  );

  res.status(200).send()
}