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

        const professionals = await prisma.professional.findMany({ where: { userId }, orderBy: { name: 'asc' } });
        return res.status(200).json(professionals);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar profissionais' });
    }
});

router.get('/:userId/:professionalId', async (req, res) => {
    const { userId, professionalId } = req.params;

    if (!userId || !professionalId) {
        return res.status(400).json({ message: 'ID do usuário e do profissional são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const professional = await prisma.professional.findUnique({ where: { id: professionalId } });

        if (!professional) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        return res.status(200).json(professional);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar profissional' });
    }
});

router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

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

        if (!name) {
            return res.status(400).json({ message: 'Nome do profissional é obrigatório' });
        }

        const professional = await prisma.professional.create({
            data: {
                name,
                email,
                phone,
                userId,
            },
        });

        return res.status(201).json(professional);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar profissional' });
    }
});

router.put('/:userId/:professionalId', async (req, res) => {
    const { userId, professionalId } = req.params;
    const { name, email, phone } = req.body;

    if (!userId || !professionalId) {
        return res.status(400).json({ message: 'ID do usuário e do profissional são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const professional = await prisma.professional.update({
            where: { id: professionalId },
            data: { name, email, phone },
        });

        return res.status(200).json(professional);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar profissional' });
    }
});

router.delete('/:userId/:professionalId', async (req, res) => {
    const { userId, professionalId } = req.params;

    if (!userId || !professionalId) {
        return res.status(400).json({ message: 'ID do usuário e do profissional são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        await prisma.professional.delete({ where: { id: professionalId } });

        return res.status(204).json({ message: 'Profissional deletado com sucesso' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao deletar profissional' });
    }
});

export default router;