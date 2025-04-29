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
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const appointments = await prisma.appointment.findMany({
            where: { userId }, orderBy: [{ date: 'desc' }, { time: { startTime: 'asc' } }], include: {
                client: true,
                professional: true,
                section: true,
                time: true,
            }
        });
        return res.status(200).json(appointments);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
});

router.get('/:userId/:appointmentId', async (req, res) => {
    const { userId, appointmentId } = req.params;

    if (!userId || !appointmentId) {
        return res.status(400).json({ message: 'ID do usuário e do agendamento são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }, include: {
                client: true,
                professional: true,
                section: true,
            }
        });
        if (!appointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        return res.status(200).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar agendamento' });
    }
});

router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { clientId, professionalId, sectionId, date, timeId, price, paidAt } = req.body;

    if (!userId || !clientId || !professionalId || !sectionId || !date || !timeId || !price || !paidAt) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const appointment = await prisma.appointment.create({
            data: { clientId, professionalId, sectionId, date, timeId, userId, price, paidAt },
        });

        return res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao criar agendamento' });
    }
});

router.put('/:userId/:appointmentId', async (req, res) => {
    const { userId, appointmentId } = req.params;
    const { clientId, professionalId, sectionId, date, timeId, price, paidAt } = req.body;

    if (!userId || !appointmentId || !clientId || !professionalId || !sectionId || !date || !timeId || !price || !paidAt) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { clientId, professionalId, sectionId, date, timeId, price, paidAt },
        });

        return res.status(200).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar agendamento' });
    }
});

router.put('/:userId/:appointmentId/price', async (req, res) => {
    const { userId, appointmentId } = req.params;
    const { paidAt } = req.body;

    if (!userId || !appointmentId || !paidAt) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { paidAt },
        });

        return res.status(200).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar preço do agendamento' });
    }
});

router.delete('/:userId/:appointmentId', async (req, res) => {
    const { userId, appointmentId } = req.params;

    if (!userId || !appointmentId) {
        return res.status(400).json({ message: 'ID do usuário e do agendamento são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        await prisma.appointment.delete({ where: { id: appointmentId } });

        return res.status(204).json({ message: 'Agendamento deletado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar agendamento' });
    }
});

export default router;


