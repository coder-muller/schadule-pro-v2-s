import cors from 'cors';
import express, { Request, Response } from 'express';
import usersRouter from './routes/users';
import clientsRouter from './routes/clients';
import loginRouter from './routes/login';
import professionalsRouter from './routes/professionals';
import sectionsRouter from './routes/sections';
import appointmentsRouter from './routes/appointment';
import timesRouter from './routes/times';
const app = express();
const PORT = process.env.PORT || 8888; 

// Middleware  
app.use(cors());
app.use(express.json()); 

// Rotas
app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: 'API funcionando corretamente!' });
});

app.use('/login', loginRouter);
app.use('/users', usersRouter);
app.use('/clients', clientsRouter);
app.use('/professionals', professionalsRouter);
app.use('/sections', sectionsRouter);
app.use('/times', timesRouter);
app.use('/appointments', appointmentsRouter);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 