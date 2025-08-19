'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, Swap, Certificate } from '@/types';
import DashboardSummaryCard from '@/components/master/DashboardSummaryCard';
import styles from './MasterDashboard.module.css';
import { useRouter } from 'next/navigation'; // 1. Importar o useRouter

export default function MasterDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingSwaps: 0,
        pendingCertificates: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter(); // 2. Inicializar o router

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError('');
            const token = Cookies.get('authToken');
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

            try {
                const [usersRes, swapsRes, certsRes] = await Promise.all([
                    fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiURL}/api/swaps?status=pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiURL}/api/certificates?status=pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                ]);

                if (!usersRes.ok || !swapsRes.ok || !certsRes.ok) {
                    throw new Error('Falha ao carregar as estatísticas.');
                }

                const users: User[] = await usersRes.json();
                const swaps: Swap[] = await swapsRes.json();
                const certificates: Certificate[] = await certsRes.json();

                setStats({
                    totalUsers: users.filter(u => u.userType === 'collaborator').length,
                    pendingSwaps: swaps.length,
                    pendingCertificates: certificates.length,
                });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);
    
    // 3. Adicionar a função de logout
    const handleLogout = () => {
        Cookies.remove('authToken');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    return (
        <div>
            {/* 4. Adicionar o cabeçalho com o botão */}
            <div className={styles.header}>
                <h1>Dashboard do Administrador</h1>
                <button onClick={handleLogout}>Sair</button>
            </div>

            {isLoading ? (
                <p>A carregar estatísticas...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <div className={styles.grid}>
                    <DashboardSummaryCard 
                        title="Total de Colaboradores"
                        value={stats.totalUsers}
                        linkTo="/dashboard/users"
                        linkLabel="Gerir colaboradores"
                    />
                    <DashboardSummaryCard 
                        title="Trocas Pendentes"
                        value={stats.pendingSwaps}
                        linkTo="/dashboard/swaps?status=pending"
                        linkLabel="Ver trocas"
                    />
                    <DashboardSummaryCard 
                        title="Atestados Pendentes"
                        value={stats.pendingCertificates}
                        linkTo="/dashboard/certificates?status=pending"
                        linkLabel="Ver atestados"
                    />
                </div>
            )}
        </div>
    );
}