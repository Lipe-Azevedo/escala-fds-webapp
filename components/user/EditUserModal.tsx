'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, TeamName, PositionName } from '@/types';
import styles from './EditUserModal.module.css';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

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

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        team: user.team,
        position: user.position,
        shift: user.shift,
        weekdayOff: user.weekdayOff,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      const res = await fetch(`${apiURL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao atualizar o colaborador.'); }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Editar Colaborador</h2>
        <p><strong>Nome:</strong> {user.firstName} {user.lastName}</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div>
              <label htmlFor="team">Equipe</label>
              <select id="team" name="team" value={formData.team} onChange={handleChange} required>
                <option value="Security">Segurança</option>
                <option value="Support">Suporte</option>
                <option value="CustomerService">Atendimento</option>
              </select>
            </div>
            <div>
              <label htmlFor="position">Cargo</label>
              <select id="position" name="position" value={formData.position} onChange={handleChange} required>
                {positionsByTeam[formData.team as TeamName]?.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="shift">Turno</label>
              <select id="shift" name="shift" value={formData.shift} onChange={handleChange} required>
                <option value="06:00-14:00">Manhã (06:00-14:00)</option>
                <option value="14:00-22:00">Tarde (14:00-22:00)</option>
                <option value="22:00-06:00">Noite (22:00-06:00)</option>
              </select>
            </div>
            <div>
              <label htmlFor="weekdayOff">Folga da Semana</label>
              <select id="weekdayOff" name="weekdayOff" value={formData.weekdayOff} onChange={handleChange} required>
                <option value="monday">Segunda</option>
                <option value="tuesday">Terça</option>
                <option value="wednesday">Quarta</option>
                <option value="thursday">Quinta</option>
                <option value="friday">Sexta</option>
              </select>
            </div>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#4a5568' }}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}