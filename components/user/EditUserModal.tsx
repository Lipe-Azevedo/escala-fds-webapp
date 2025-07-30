'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, TeamName, PositionName } from '@/types';

const positionsByTeam: Record<TeamName, { value: PositionName, label: string }[]> = {
  'Security': [
    { value: 'Security', label: 'Segurança' },
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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User;
}

export default function EditUserModal({ isOpen, onClose, onUserUpdated, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    team: user.team,
    position: user.position,
    shift: user.shift,
    weekdayOff: user.weekdayOff,
    initialWeekendOff: user.initialWeekendOff,
  });
  
  const [availablePositions, setAvailablePositions] = useState<{ value: PositionName, label: string }[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAvailablePositions(positionsByTeam[formData.team] || []);
  }, [formData.team]);

  if (!isOpen) return null;

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
      const res = await fetch(`${apiURL}/api/users/${user.id}/work`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao atualizar usuário.'); }

      onUserUpdated();
      onClose();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };

  const modalContentStyle: React.CSSProperties = {
    background: 'rgb(var(--card-background-rgb))',
    padding: '25px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    color: 'rgb(var(--foreground-rgb))',
    border: '1px solid rgb(var(--card-border-rgb))',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '25px' }}>Editar Dados de Trabalho de {user.firstName}</h2>
        <form onSubmit={handleSubmit}>
            <label htmlFor="team">Equipe</label>
            <select id="team" name="team" value={formData.team} onChange={handleChange} required>
                <option value="">Selecione...</option>
                <option value="Security">Segurança</option>
                <option value="Support">Suporte</option>
                <option value="CustomerService">Atendimento</option>
            </select>
            
            <label htmlFor="position">Cargo</label>
            <select id="position" name="position" value={formData.position} onChange={handleChange} required disabled={!formData.team}>
                <option value="">Selecione...</option>
                {availablePositions.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
            </select>
            
            <label htmlFor="shift">Turno</label>
            <select id="shift" name="shift" value={formData.shift} onChange={handleChange} required>
              <option value="">Selecione o Turno</option>
              <option value="06:00-14:00">Manhã (06:00-14:00)</option>
              <option value="14:00-22:00">Tarde (14:00-22:00)</option>
              <option value="22:00-06:00">Noite (22:00-06:00)</option>
            </select>
            
            <label htmlFor="weekdayOff">Folga da Semana</label>
            <select id="weekdayOff" name="weekdayOff" value={formData.weekdayOff} onChange={handleChange} required>
                <option value="">Selecione...</option>
                <option value="monday">Segunda</option>
                <option value="tuesday">Terça</option>
                <option value="wednesday">Quarta</option>
                <option value="thursday">Quinta</option>
                <option value="friday">Sexta</option>
            </select>
            
            <label htmlFor="initialWeekendOff">Folga Inicial do Fim de Semana</label>
            <select id="initialWeekendOff" name="initialWeekendOff" value={formData.initialWeekendOff} onChange={handleChange} required>
                <option value="">Selecione...</option>
                <option value="saturday">Sábado</option>
                <option value="sunday">Domingo</option>
            </select>

          {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}