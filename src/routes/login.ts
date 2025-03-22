import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        res.status(401).json({ message: 'Usuário não encontrado' });
        return;
    }

    if (!user.valid) {
        res.status(401).json({ message: 'Usuário não validado' });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        res.status(401).json({ message: 'Senha inválida' });
        return; 
    }

    res.json({ userId: user.id, userName: user.name });

});

export default router;
