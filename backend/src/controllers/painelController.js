import { painelService, POSTOS_PAINEL } from "../services/painelService.js";

export const streamChamadas = (req, res) => {
  const postoQuery = req.query.posto
    ? String(req.query.posto).toLowerCase()
    : null;
  const postoFiltro =
    postoQuery && POSTOS_PAINEL.has(postoQuery) ? postoQuery : null;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const enviar = (evento, dados) => {
    res.write(`event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`);
  };

  enviar("estado_inicial", {
    chamadas: painelService.obterHistorico(postoFiltro),
  });

  const aoChamar = (dados) => {
    if (postoFiltro && dados.posto !== postoFiltro) return;
    enviar("chamada", dados);
  };

  const aoResetar = () => enviar("reset", {});

  painelService.on("chamada", aoChamar);
  painelService.on("reset", aoResetar);

  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(pingInterval);
    painelService.off("chamada", aoChamar);
    painelService.off("reset", aoResetar);
  });
};
