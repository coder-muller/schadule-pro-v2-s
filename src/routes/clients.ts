import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

const prisma = new PrismaClient();

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        res.status(400).json({ message: 'ID do usuário é obrigatório' });
        return;
    }

    try {
        const clients = await prisma.client.findMany({ where: { userId: userId }, orderBy: [{ status: 'asc' }, { name: 'asc' }] });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar clientes' });
    }
});

router.get('/:userId/:clientId', async (req: Request, res: Response) => {
    const { userId, clientId } = req.params;

    if (!userId || !clientId) {
        res.status(400).json({ message: 'ID do usuário e do cliente são obrigatórios' });
        return;
    }

    try {
        const client = await prisma.client.findUnique({ where: { id: clientId, userId: userId } });
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cliente' });
    }
});

router.post('/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { name, email, phone, status, address, birthDate, cpf, observations } = req.body;

    console.log(`userId: ${userId}, name: ${name}, email: ${email}, phone: ${phone}, status: ${status}`);

    if (!userId || !name || !status) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
    }

    try {
        const client = await prisma.client.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                status,
                address: address || null,
                birthDate: birthDate ? new Date(birthDate) : null,
                cpf: cpf || null,
                observations: observations || null,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
        res.json(client);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao criar cliente' });
    }
});

router.put('/:userId/:clientId', async (req: Request, res: Response) => {
    const { userId, clientId } = req.params;
    const { name, email, phone, status, address, birthDate, cpf, observations } = req.body;

    if (!userId || !clientId || !name || !status) {
        res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        return;
    }

    try {
        const client = await prisma.client.update({ where: { id: clientId, userId: userId }, data: { name, email: email || null, phone: phone || null, status, address: address || null, birthDate: birthDate ? new Date(birthDate) : null, cpf: cpf || null, observations: observations || null } });
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar cliente' });
    }
});

router.delete('/:userId/:clientId', async (req: Request, res: Response) => {
    const { userId, clientId } = req.params;

    if (!userId || !clientId) {
        res.status(400).json({ message: 'ID do usuário e do cliente são obrigatórios' });
        return;
    }

    try {
        await prisma.client.delete({ where: { id: clientId, userId: userId } });
        res.json({ message: 'Cliente deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar cliente' });
    }
});


export default router;