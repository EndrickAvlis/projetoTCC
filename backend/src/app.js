// Configura o Express e registra as rotas disponíveis na API.
import express from "express";
import cors from "cors";
import "dotenv/config";
import filaRoutes from "./routes/filaRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Disponibiliza as rotas da fila a partir de /filas.
app.use("/filas", filaRoutes);

// Confirma que a API está disponível.
app.get("/", (req, res) => {
  res.json({ mensagem: "A API está rodando", status: "online" });
});

export default app;