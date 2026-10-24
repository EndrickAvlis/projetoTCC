import SenhaService from "../services/senhaService.js";
import HistoricoSenhaService from "../services/historicoSenhaService.js";
import AlunoService from "../services/alunoService.js";
import AppError from "../errors/AppError.js";
import { exactOptional } from "zod";

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
  
  if (senha.statusSenha !== "aguardando") {
    throw senhaNaoAguardando();
  }

  if (senha.etapaSenha !== etapaUsuario) {
    throw etapasDiferentes();
  }

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAberto(idUsuario, etapaUsuario);

  if (atendimentoAberto){
    throw atendimentoAbertoError();
  }

  const agora = new Date();

  const novoHistoricoDeSenha = await historicoSenhaService.criar({
    codSenha: senha.idSenha,
    codVoluntario: idUsuario,
    etapaHistorico: senha.etapaSenha,
    dataHoraInicioHistorico: agora
  });

  await senhaService.atualizar(senha.idSenha, {
    statusSenha: "em_atendimento",
  });

  res.status(201).json({
    mensagem: "Atendimento iniciado com sucesso.",
    atendimento: {
      idHistorico: novoHistoricoDeSenha.idHistorico,
      iniciadoEm: novoHistoricoDeSenha.dataHoraInicioHistorico
    }
  }).send();
}

export const recuperarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const etapa = req.validado.params.etapa;

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAberto(idUsuario, etapa);

  if (!atendimentoAberto){
    res.status(200).json({
      senha: null,
      atendimento: null,
    });
  }

  const senha = await senhaService.buscarPorId(atendimentoAberto.codSenha);

  let alunoResposta = {
    idAluno: null,
    nome: null
  };

  if(senha.codAluno){
    const alunoSenha = await alunoService.buscarAlunoPorId(senha.codAluno);

    alunoResposta = {
      idAluno: alunoSenha.idAluno,
      nome: alunoSenha.nomeAluno
    }
  }

  res.status(200).json({
    senha:{
      id: senha.id,
      codigo: senha.senhaCodigo,
      prioritaria: senha.tipoSenha,
      etapa: senha.etapaSenha,
      aluno: alunoResposta
    },
    atendimento:{
      idHistorico: atendimentoAberto.idHistorico,
      iniciadoEm: atendimentoAberto.dataHoraInicioHistorico
    }
  });
}

export const finalizarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idSenha = req.validado.body.senhaId;

  const senha = await senhaService.buscarPorId(idSenha);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  if (senha.statusSenha !== "em_atendimento"){
    throw senhaNaoEmAtendimento();
  }

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAbertoComSenha(idUsuario, senha.idSenha, senha.etapaSenha);

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

  const senhaAtualizada = await senhaService.avancarEtapa(senha.idSenha, senha.etapaSenha);

  res.status(200).json({
    mensagem: "Atendimento finalizado com sucesso.",
    proximaEtapa: senhaAtualizada.etapaSenha
  });
}

export const cancelarAtendimento = async (req, res) => {
  const idUsuario = req.usuario.id;
  const idSenha = req.validado.body.senhaId;
  const agora = new Date();

  const senha = await senhaService.buscarPorId(idSenha);

  if (!senha) {
    throw senhaNaoEncontrada();
  }

  const atendimentoAberto = await historicoSenhaService.listarAtendimentoAbertoComSenha(idUsuario, senha.idSenha, senha.etapaSenha);

  if (!atendimentoAberto) {
    throw atendimentoNaoEncontrado();
  }

  await historicoSenhaService.atualizar(atendimentoAberto.idHistorico,
    {
      dataHoraFimHistorico: agora
    }
  );

  await senhaService.atualizar(senha.idSenha, 
    {
      statusSenha: "cancelada",
      dataHoraFimSenha: agora
    }
  );

  res.status(200).json({
    mensagem: "Atendimento cancelado com sucesso"
  })
}




const senhaNaoEncontrada = () =>
  new AppError("Senha não encontrada.", {
    status: 404,
    code: "SENHA_NAO_ENCONTRADA",
});

const senhaNaoAguardando = () => 
  new AppError("Senha em atendimento ou finalizada", {
    status: 400,
    code: "SENHA_NAO_AGUARDANDO",
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
  })