'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { TeamName, PositionName, User } from '@/types';
import styles from './NewUser.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const positionsByTeam: Record<TeamName, { value: PositionName, label: string }[]> = {
  'Security': [
    { value: 'RiskAnalyst', label: 'Analista de Risco' },
    { value: 'SupervisorI', label: 'Supervisor I' },
    { value: 'SupervisorII', label: 'Supervisor II' },
  ],
  'Support': [
    { value: 'BackendDeveloper', label: 'Desenvolvedor Backend' },
    { value: 'FrontendDeveloper', label: 'Desenvolvedor Frontend' },
  ],
  'CustomerService': [
    { value: 'Attendant', label: 'Atendente' },
    { value: 'SupervisorI', label: 'Supervisor I' },
    { value: 'SupervisorII', label: 'Supervisor II' },
  ],
  '': [],
};

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthday: '',
    userType: 'collaborator' as User['userType'],
    team: '' as TeamName,
    position: '' as PositionName,
    shift: '',
    weekdayOff: '',
    initialWeekendOff: '',
    superiorId: '',
  });
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [availablePositions, setAvailablePositions] = useState<{ value: PositionName, label: string }[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const res = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                setAllUsers(await res.json());
            }
        } catch (error) {
            console.error("Falha ao ir buscar os utilizadores", error);
        }
    };
    fetchUsers();
  }, []);

  const supervisors = allUsers.filter(u => u.position.includes('Supervisor') || u.userType === 'master');

  useEffect(() => {
    setAvailablePositions(positionsByTeam[formData.team] || []);
    setFormData(prev => ({ ...prev, position: '' }));
  }, [formData.team]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${apiURL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            ...formData,
            superiorId: formData.superiorId ? Number(formData.superiorId) : null,
        })
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao criar o utilizador.'); }

      router.push('/dashboard/users');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
        <h1>Criar Novo Colaborador</h1>
        <div className={styles.card}>
            <form onSubmit={handleSubmit}>
                <div className={styles.section}>
                    <div className={styles.formGrid}>
                        <div className={styles.fullWidth}>
                            <label htmlFor="userType">Tipo de Utilizador</label>
                            <select name="userType" value={formData.userType} onChange={handleChange}>
                                <option value="collaborator">Colaborador</option>
                                <option value="master">Master</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="firstName">Nome</label>
                            <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="lastName">Sobrenome</label>
                            <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="birthday">Data de Nascimento</label>
                            <input id="birthday" name="birthday" type="date" value={formData.birthday} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber">Telefone</label>
                            <input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} required />
                        </div>
                        <div className={styles.fullWidth}>
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className={styles.fullWidth}>
                            <label htmlFor="password">Senha</label>
                            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {formData.userType === 'collaborator' && (
                <div className={styles.section}>
                    <div className={styles.formGrid}>
                        <div>
                            <label htmlFor="team">Equipe</label>
                            <select id="team" name="team" value={formData.team} onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                <option value="Security">Segurança</option>
                                <option value="Support">Suporte</option>
                                <option value="CustomerService">Atendimento</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="position">Cargo</label>
                            <select id="position" name="position" value={formData.position} onChange={handleChange} required disabled={!formData.team}>
                                <option value="">Selecione...</option>
                                {availablePositions.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="superiorId">Supervisor</label>
                            <select id="superiorId" name="superiorId" value={formData.superiorId} onChange={handleChange}>
                                <option value="">Nenhum</option>
                                {supervisors.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="shift">Turno</label>
                            <select id="shift" name="shift" value={formData.shift} onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                <option value="06:00-14:00">Manhã (06:00-14:00)</option>
                                <option value="14:00-22:00">Tarde (14:00-22:00)</option>
                                <option value="22:00-06:00">Noite (22:00-06:00)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="weekdayOff">Folga da Semana</label>
                            <select id="weekdayOff" name="weekdayOff" value={formData.weekdayOff} onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                <option value="monday">Segunda</option>
                                <option value="tuesday">Terça</option>
                                <option value="wednesday">Quarta</option>
                                <option value="thursday">Quinta</option>
                                <option value="friday">Sexta</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="initialWeekendOff">Folga Inicial do Fim de Semana</label>
                            <select id="initialWeekendOff" name="initialWeekendOff" value={formData.initialWeekendOff} onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                <option value="saturday">Sábado</option>
                                <option value="sunday">Domingo</option>
                            </select>
                        </div>
                    </div>
                </div>
                )}
                
                {error && <p style={{ color: '#f87171', textAlign: 'center', marginTop: '20px' }}>{error}</p>}
                
                <div className={styles.actions}>
                    <Link href="/dashboard/users">
                        <button type="button" style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
                    </Link>
                    <button type="submit" disabled={isLoading}>{isLoading ? 'A salvar...' : 'Salvar Utilizador'}</button>
                </div>
            </form>
        </div>
    </div>
  );
}