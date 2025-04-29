import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

const prisma = new PrismaClient()

const router = Router()

// Endpoint para obter métricas financeiras
router.get('/financial/:userId', async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }
    
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.valid) {
            return res.status(403).json({ message: 'Usuário não encontrado ou não validado' });
        }
        
        // Data atual e início do mês atual
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        
        // Receita do mês atual (agendamentos pagos no mês atual)
        const currentMonthRevenue = await prisma.appointment.aggregate({
            where: {
                userId,
                paidAt: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd
                }
            },
            _sum: {
                price: true
            }
        });
        
        // Receita planejada (agendamentos não pagos)
        const plannedRevenue = await prisma.appointment.aggregate({
            where: {
                userId,
                paidAt: null
            },
            _sum: {
                price: true
            }
        });
        
        // Ticket médio (média de preço por cliente)
        const averageTicket = await prisma.appointment.groupBy({
            by: ['clientId'],
            where: {
                userId,
                paidAt: { not: null }
            },
            _avg: {
                price: true
            }
        });
        
        const overallAverageTicket = averageTicket.length 
            ? averageTicket.reduce((acc, curr) => acc + Number(curr._avg.price || 0), 0) / averageTicket.length 
            : 0;
        
        // Receita dos últimos 12 meses
        const last12MonthsRevenue = [];
        
        for (let i = 11; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(now, i));
            const monthEnd = endOfMonth(subMonths(now, i));
            
            const monthRevenue = await prisma.appointment.aggregate({
                where: {
                    userId,
                    paidAt: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                },
                _sum: {
                    price: true
                }
            });
            
            last12MonthsRevenue.push({
                month: format(monthStart, 'MMM'),
                revenue: monthRevenue._sum.price || 0
            });
        }
        
        return res.status(200).json({
            currentMonthRevenue: currentMonthRevenue._sum.price || 0,
            plannedRevenue: plannedRevenue._sum.price || 0,
            averageTicket: overallAverageTicket,
            last12MonthsRevenue
        });
        
    } catch (error) {
        console.error('Erro ao buscar métricas financeiras:', error);
        return res.status(500).json({ message: 'Erro ao buscar métricas financeiras' });
    }
});

// Endpoint para obter métricas de clientes
router.get('/clients/:userId', async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }
    
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.valid) {
            return res.status(403).json({ message: 'Usuário não encontrado ou não validado' });
        }
        
        // Data atual e início do mês atual
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        
        // Total de clientes ativos
        const activeClients = await prisma.client.count({
            where: {
                userId,
                status: 'active'
            }
        });
        
        // Total de clientes inativos
        const inactiveClients = await prisma.client.count({
            where: {
                userId,
                status: 'inactive'
            }
        });
        
        // Novos clientes este mês
        const newClients = await prisma.client.count({
            where: {
                userId,
                createdAt: {
                    gte: currentMonthStart
                }
            }
        });
        
        // Crescimento mensal de clientes nos últimos 6 meses
        const clientGrowth = [];
        
        for (let i = 5; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(now, i));
            const monthEnd = endOfMonth(subMonths(now, i));
            
            const newClientsInMonth = await prisma.client.count({
                where: {
                    userId,
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            });
            
            clientGrowth.push({
                month: format(monthStart, 'MMM'),
                newClients: newClientsInMonth
            });
        }
        
        return res.status(200).json({
            activeClients,
            inactiveClients,
            newClients,
            clientGrowth
        });
        
    } catch (error) {
        console.error('Erro ao buscar métricas de clientes:', error);
        return res.status(500).json({ message: 'Erro ao buscar métricas de clientes' });
    }
});

// Endpoint para obter métricas por setor
router.get('/sections/:userId', async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }
    
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.valid) {
            return res.status(403).json({ message: 'Usuário não encontrado ou não validado' });
        }
        
        // Buscar todos os setores do usuário
        const sections = await prisma.section.findMany({
            where: { userId }
        });
        
        // Para cada setor, calcular métricas
        const sectionMetrics = await Promise.all(
            sections.map(async (section) => {
                // Número de agendamentos neste setor
                const appointmentCount = await prisma.appointment.count({
                    where: {
                        userId,
                        sectionId: section.id
                    }
                });
                
                // Receita por setor (agendamentos pagos)
                const revenue = await prisma.appointment.aggregate({
                    where: {
                        userId,
                        sectionId: section.id,
                        paidAt: { not: null }
                    },
                    _sum: {
                        price: true
                    }
                });
                
                // Número de clientes únicos neste setor
                const uniqueClients = await prisma.appointment.groupBy({
                    by: ['clientId'],
                    where: {
                        userId,
                        sectionId: section.id
                    },
                    _count: {
                        clientId: true
                    }
                });
                
                return {
                    id: section.id,
                    name: section.description,
                    appointmentCount,
                    revenue: revenue._sum.price || 0,
                    clientCount: uniqueClients.length
                };
            })
        );
        
        // Ordenar setores por número de agendamentos para encontrar o mais usado
        const sortedSections = [...sectionMetrics].sort((a, b) => b.appointmentCount - a.appointmentCount);
        const mostUsedSection = sortedSections.length > 0 ? sortedSections[0] : null;
        
        return res.status(200).json({
            sectionMetrics,
            mostUsedSection
        });
        
    } catch (error) {
        console.error('Erro ao buscar métricas por setor:', error);
        return res.status(500).json({ message: 'Erro ao buscar métricas por setor' });
    }
});

// Endpoint para obter métricas por profissional
router.get('/professionals/:userId', async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }
    
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.valid) {
            return res.status(403).json({ message: 'Usuário não encontrado ou não validado' });
        }
        
        // Buscar todos os profissionais do usuário
        const professionals = await prisma.professional.findMany({
            where: { userId }
        });
        
        // Para cada profissional, calcular métricas
        const professionalMetrics = await Promise.all(
            professionals.map(async (professional) => {
                // Número de agendamentos com este profissional
                const appointmentCount = await prisma.appointment.count({
                    where: {
                        userId,
                        professionalId: professional.id
                    }
                });
                
                // Receita por profissional (agendamentos pagos)
                const revenue = await prisma.appointment.aggregate({
                    where: {
                        userId,
                        professionalId: professional.id,
                        paidAt: { not: null }
                    },
                    _sum: {
                        price: true
                    }
                });
                
                // Número de clientes únicos atendidos por este profissional
                const uniqueClients = await prisma.appointment.groupBy({
                    by: ['clientId'],
                    where: {
                        userId,
                        professionalId: professional.id
                    },
                    _count: {
                        clientId: true
                    }
                });
                
                return {
                    id: professional.id,
                    name: professional.name,
                    appointmentCount,
                    revenue: revenue._sum.price || 0,
                    clientCount: uniqueClients.length
                };
            })
        );
        
        // Ordenar profissionais por receita
        const sortedByRevenue = [...professionalMetrics].sort((a, b) => Number(b.revenue) - Number(a.revenue));
        
        return res.status(200).json({
            professionalMetrics,
            topPerformer: sortedByRevenue.length > 0 ? sortedByRevenue[0] : null
        });
        
    } catch (error) {
        console.error('Erro ao buscar métricas por profissional:', error);
        return res.status(500).json({ message: 'Erro ao buscar métricas por profissional' });
    }
});

export default router