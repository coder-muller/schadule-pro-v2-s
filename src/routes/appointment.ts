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
    const { clientId, professionalId, sectionId, date, timeId, price, paidAt, status } = req.body;

    if (!userId || !clientId || !professionalId || !sectionId || !date || !status || !timeId || !price) {
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
            data: { clientId, professionalId, sectionId, date, timeId, userId, status, price: price ? Number(price) : 0, paidAt: paidAt ? new Date(paidAt) : null },
        });

        return res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao criar agendamento' });
    }
});

router.put('/:userId/:appointmentId', async (req, res) => {
    const { userId, appointmentId } = req.params;
    const { clientId, professionalId, sectionId, date, timeId, price, paidAt, status } = req.body;

    if (!userId || !appointmentId || !clientId || !professionalId || !sectionId || !date || !timeId || !price || !status) {
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
            data: { clientId, professionalId, sectionId, date, timeId, price, paidAt, status },
        });

        return res.status(200).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar agendamento' });
    }
});

router.put('/:userId/:appointmentId/status', async (req, res) => {
    const { userId, appointmentId } = req.params;
    const { status } = req.body;

    if (!userId || !appointmentId || !status) {
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
            data: { status },
        });

        return res.status(200).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar status do agendamento' });
    }
});

// Endpoint para marcar um agendamento como pago
router.put('/:userId/:appointmentId/payment', async (req, res) => {
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

        // Criar uma data no formato esperado para GMT-3
        const today = new Date();
        const formattedDate = `${today.toISOString().split('T')[0]}T03:00:00.000Z`;

        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { paidAt: new Date(formattedDate) },
        });

        return res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao marcar agendamento como pago' });
    }
});

router.put('/:userId/:appointmentId/unpaid', async (req, res) => {
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

        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { paidAt: null },
        });

        return res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao marcar agendamento como não pago' });
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


