import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId }} );
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const times = await prisma.time.findMany({ where: { userId }, orderBy: { startTime: 'asc' } });
        return res.status(200).json(times);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar horários' });
    }
});

router.get('/:userId/:timeId', async (req, res) => {
    const { userId, timeId } = req.params;

    if (!userId || !timeId) {
        return res.status(400).json({ message: 'ID do usuário e do horário são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const time = await prisma.time.findUnique({ where: { id: timeId } });
        if (!time) {
            return res.status(404).json({ message: 'Horário não encontrado' });
        }

        return res.status(200).json(time);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar horário' });
    }
});

router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { startTime, endTime } = req.body;

    if (!userId || !startTime || !endTime) {
        return res.status(400).json({ message: 'ID do usuário e horário são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const time = await prisma.time.create({
            data: { startTime, endTime, userId },
        });

        return res.status(201).json(time);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar horário' });
    }
});

router.put('/:userId/:timeId', async (req, res) => {
    const { userId, timeId } = req.params;
    const { startTime, endTime } = req.body;

    if (!userId || !timeId || !startTime || !endTime) {
        return res.status(400).json({ message: 'ID do usuário, horário e horário são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const time = await prisma.time.update({
            where: { id: timeId },
            data: { startTime, endTime },
        });

        return res.status(200).json(time);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar horário' });
    }
});

router.delete('/:userId/:timeId', async (req, res) => {
    const { userId, timeId } = req.params;

    if (!userId || !timeId) {
        return res.status(400).json({ message: 'ID do usuário e do horário são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        await prisma.time.delete({ where: { id: timeId } });

        return res.status(204).json({ message: 'Horário deletado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar horário' });
    }
});

export default router;  
