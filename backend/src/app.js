import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import senhaRoute from './routes/senhas'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/senhas' , senhaRoute)

app.get('/', (req, res) => {
    res.json({ mensagem: 'A API está rodando', status: 'online' });
});

export default app;
