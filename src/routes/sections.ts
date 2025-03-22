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

        const sections = await prisma.section.findMany({ where: { userId }, orderBy: { description: 'asc' } });
        return res.status(200).json(sections);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar seções' });
    }
});

router.get('/:userId/:sectionId', async (req, res) => {
    const { userId, sectionId } = req.params;

    if (!userId || !sectionId) {
        return res.status(400).json({ message: 'ID do usuário e da seção são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const section = await prisma.section.findUnique({ where: { id: sectionId } });
        if (!section) {
            return res.status(404).json({ message: 'Seção não encontrada' });
        }

        return res.status(200).json(section);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar seção' });
    }
});

router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { description } = req.body;

    if (!userId || !description) {
        return res.status(400).json({ message: 'ID do usuário e descrição são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const section = await prisma.section.create({
            data: { description, userId },
        });

        return res.status(201).json(section);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar seção' });
    }
});

router.put('/:userId/:sectionId', async (req, res) => {
    const { userId, sectionId } = req.params;
    const { description } = req.body;

    if (!userId || !sectionId || !description) {
        return res.status(400).json({ message: 'ID do usuário, seção e descrição são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        const section = await prisma.section.update({
            where: { id: sectionId },
            data: { description },
        });

        return res.status(200).json(section);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar seção' });
    }
});

router.delete('/:userId/:sectionId', async (req, res) => {
    const { userId, sectionId } = req.params;

    if (!userId || !sectionId) {
        return res.status(400).json({ message: 'ID do usuário e da seção são obrigatórios' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (!user.valid) {
            return res.status(403).json({ message: 'Usuário não validado' });
        }

        await prisma.section.delete({ where: { id: sectionId } });

        return res.status(204).json({ message: 'Seção deletada com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar seção' });
    }
});

export default router;


