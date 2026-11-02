import { painelService } from "../services/painelService.js";

export const streamChamadas = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const enviarSenha = (dados) => {
    res.write(`data: ${JSON.stringify(dados)}\n\n`);
  };

  painelService.on("chamada", enviarSenha);

  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(pingInterval);
    painelService.off("chamada", enviarSenha);
  });
};
