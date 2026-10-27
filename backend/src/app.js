import express from "express";
import cors from "cors";
import "dotenv/config";
import filaRoutes from "./routes/filaRoutes.js";
import senhaRouter from "./routes/senhaRoutes.js";
import cursoRoutes from "./routes/cursoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import produtosRoutes from "./routes/produtosRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import alunoRoutes from "./routes/alunoRoutes.js";
import atendimentoRoutes from "./routes/atendimentoRoutes.js";
import triagemRoutes from "./routes/triagemRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";


const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());


app.use("/filas", filaRoutes);
app.use("/senhas", senhaRouter);
app.use("/cursos", cursoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/produtos", produtosRoutes);
app.use("/auth", authRoutes);
app.use("/alunos", alunoRoutes);
app.use("/atendimentos", atendimentoRoutes);
app.use("/", triagemRoutes);
app.use("/relatorios", relatorioRoutes);

app.get("/", (req, res) => {
  res.json({
    mensagem: "A API está rodando",
    status: "online",
  });
});

app.use(errorHandler);

export default app;