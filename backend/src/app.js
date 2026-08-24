import express from "express";
import cors from "cors";
import "dotenv/config";
import filaRoutes from "./routes/filaRoutes.js";
import senhaRouter from "./routes/senhaRoutes.js";
import cursoRoutes from "./routes/cursoRoutes.js";
import voluntarioRoutes from "./routes/voluntarioRoutes.js";
import produtosRoutes from "./routes/produtosRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/filas", filaRoutes);
app.use("/senhas", senhaRouter);
app.use("/admin/cursos", cursoRoutes);
app.use("/voluntarios", voluntarioRoutes);
app.use("/produtos", produtosRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    mensagem: "A API está rodando",
    status: "online",
  });
});

app.use(errorHandler);

export default app;