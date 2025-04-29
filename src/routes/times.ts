import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/:professionalId', async (req, res) => {
    const { professionalId } = req.params;

    if (!professionalId) {
        return res.status(400).json({ message: 'ID do profissional é obrigatório' });
    }

    try {
        const professional = await prisma.professional.findUnique({ where: { id: professionalId }, include: { times: true } });
        if (!professional) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        if (!professional.userId) {
            return res.status(403).json({ message: 'Profissional não validado' });
        }

        const times = await prisma.time.findMany({ where: { professionalId: professionalId }, orderBy: { startTime: 'asc' } });
        return res.status(200).json(times);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar horários' });
    }
});

router.get('/:professionalId/:timeId', async (req, res) => {
    const { professionalId, timeId } = req.params;

    if (!professionalId || !timeId) {
        return res.status(400).json({ message: 'ID do profissional e do horário são obrigatórios' });
    }

    try {
        const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
        if (!professional) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        if (!professional.userId) {
            return res.status(403).json({ message: 'Profissional não validado' });
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

router.post('/:professionalId', async (req, res) => {
    const { professionalId } = req.params;
    const { startTime, endTime } = req.body;

    if (!professionalId || !startTime || !endTime) {
        return res.status(400).json({ message: 'ID do profissional e horário são obrigatórios' });
    }

    try {
        const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
        if (!professional) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        if (!professional.userId) {
            return res.status(403).json({ message: 'Profissional não validado' });
        }

        const time = await prisma.time.create({
            data: { startTime, endTime, professionalId },
        });

        return res.status(201).json(time);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar horário' });
    }
});

router.put('/:professionalId/:timeId', async (req, res) => {
    const { professionalId, timeId } = req.params;
    const { startTime, endTime } = req.body;

    if (!professionalId || !timeId || !startTime || !endTime) {
        return res.status(400).json({ message: 'ID do profissional, horário e horário são obrigatórios' });
    }

    try {
        const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
        if (!professional) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        if (!professional.userId) {
            return res.status(403).json({ message: 'Profissional não validado' });
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

router.delete('/:professionalId/:timeId', async (req, res) => {
    const { professionalId, timeId } = req.params;

    if (!professionalId || !timeId) {
        return res.status(400).json({ message: 'ID do profissional e do horário são obrigatórios' });
    }

    try {
        const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
        if (!professional) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        if (!professional.userId) {
            return res.status(403).json({ message: 'Profissional não validado' });
        }

        await prisma.time.delete({ where: { id: timeId } });

        return res.status(204).json({ message: 'Horário deletado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar horário' });
    }
});

export default router;  
