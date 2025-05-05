import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                valid: true,
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: 'ID do usuário é obrigatório' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                valid: true,
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    const { name, email, valid, password } = req.body;

    if (!name || !email || !valid || !password) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios, missing: ' + (!name ? 'name' : '') + (!email ? 'email' : '') + (!valid ? 'valid' : '') + (!password ? 'password' : '') });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { name, email, valid, password: hashedPassword }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, valid, password } = req.body;

    if (!id) {
        res.status(400).json({ message: 'ID do usuário é obrigatório' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { name, email, valid, password: hashedPassword }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
});

router.put('/:id/data', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!id) {
        res.status(400).json({ message: 'ID do usuário é obrigatório' });
        return;
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { name, email }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
});

router.put('/:id/password', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password, oldPassword } = req.body;

    if (!password || !oldPassword || !id) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
        res.status(400).json({ message: 'A senha antiga não confere' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
});

router.put('/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: 'ID do usuário é obrigatório' });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { valid: !user.valid }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status do usuário' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: 'ID do usuário é obrigatório' });
        return;
    }

    try {
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
});

export default router;
