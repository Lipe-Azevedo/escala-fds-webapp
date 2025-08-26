'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, Swap, Certificate } from '@/types';
import DashboardSummaryCard from '@/components/master/DashboardSummaryCard';
import styles from './MasterDashboard.module.css';
import { isRegularDayOff } from '@/lib/calendarUtils';
import tableStyles from '@/components/common/Table.module.css';
import cardStyles from '@/components/common/Card.module.css';
import { translate } from '@/lib/translations';

export default function MasterDashboardPage() {
    const [stats, setStats] = useState({ totalUsers: 0, pendingSwaps: 0, pendingCertificates: 0 });
    const [usersOnShift, setUsersOnShift] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = Cookies.get('authToken');
            const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            try {
                const [usersRes, swapsRes, certsRes] = await Promise.all([
                    fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiURL}/api/swaps?status=pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiURL}/api/certificates?status=pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                ]);

                if (!usersRes.ok || !swapsRes.ok || !certsRes.ok) {
                    throw new Error('Falha ao carregar os dados do dashboard.');
                }

                const allUsers: User[] = await usersRes.json();
                const swaps: Swap[] = await swapsRes.json();
                const certificates: Certificate[] = await certsRes.json();

                if (Array.isArray(allUsers)) {
                    setStats({
                        totalUsers: allUsers.filter(u => u.userType !== 'master').length,
                        pendingSwaps: swaps.length,
                        pendingCertificates: certificates.length,
                    });

                    const today = new Date();
                    const isShiftNow = (shift: string): boolean => {
                        if (!shift || !shift.includes('-')) return false;
                        const currentHour = today.getHours();
                        try {
                            const [startStr, endStr] = shift.split('-');
                            const startHour = parseInt(startStr, 10);
                            const endHour = parseInt(endStr, 10);
                            if (isNaN(startHour) || isNaN(endHour)) return false;
                            return startHour < endHour ? currentHour >= startHour && currentHour < endHour : currentHour >= startHour || currentHour < endHour;
                        } catch (error) { return false; }
                    };

                    const onShiftNow = allUsers.filter(u => {
                      const isWorkingToday = !isRegularDayOff(today, u);
                      const isShiftActive = isShiftNow(u.shift);
                      return u.userType !== 'master' && isWorkingToday && isShiftActive;
                    });
                    setUsersOnShift(onShiftNow);
                } else {
                    console.error("API did not return a valid user array for master dashboard.");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    
    if (isLoading) return null; // O layout já está a mostrar o spinner

    return (
        <div>
            <div className={styles.header}>
                <h1>Dashboard do Administrador</h1>
            </div>
            {error ? <p style={{ color: 'red' }}>{error}</p> : (
                <>
                    <div className={styles.grid}>
                        <DashboardSummaryCard title="Total de Colaboradores" value={stats.totalUsers} linkTo="/dashboard/users" linkLabel="Gerir colaboradores" />
                        <DashboardSummaryCard title="Trocas Pendentes" value={stats.pendingSwaps} linkTo="/dashboard/swaps?status=pending" linkLabel="Ver trocas" />
                        <DashboardSummaryCard title="Atestados Pendentes" value={stats.pendingCertificates} linkTo="/dashboard/certificates?status=pending" linkLabel="Ver atestados" />
                    </div>
                    <div className={`${cardStyles.card} ${styles.onShiftWidget}`}>
                        <h3>Colaboradores de plantão</h3>
                        {usersOnShift.length > 0 ? (
                            <div className={tableStyles.tableWrapper}>
                                <table className={tableStyles.table}>
                                    <thead>
                                        <tr>
                                            <th className={tableStyles.header}>Nome</th>
                                            <th className={tableStyles.header}>Equipe</th>
                                            <th className={tableStyles.header}>Cargo</th>
                                            <th className={tableStyles.header}>Turno</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersOnShift.map(u => (
                                            <tr key={u.id}>
                                                <td className={tableStyles.cell}>{u.firstName} {u.lastName}</td>
                                                <td className={tableStyles.cell}>{translate(u.team)}</td>
                                                <td className={tableStyles.cell}>{translate(u.position)}</td>
                                                <td className={tableStyles.cell}>{u.shift}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{color: 'var(--text-secondary-color)', textAlign: 'center', padding: '20px'}}>Nenhum colaborador de plantão agora.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}