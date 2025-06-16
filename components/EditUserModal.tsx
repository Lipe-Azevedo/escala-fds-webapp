'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type TeamName = 'Segurança' | 'Suporte' | 'Atendimento' | '';
type PositionName = string;
type User = {
    id: number;
    team: TeamName;
    position: PositionName;
    shift: string;
    weekdayOff: string;
    initialWeekendOff: string;
};

const positionsByTeam: Record<TeamName, PositionName[]> = {
  'Segurança': ['Segurança', 'Supervisor I', 'Supervisor II'],
  'Suporte': ['Desenvolvedor Backend', 'Desenvolvedor Frontend'],
  'Atendimento': ['Atendente', 'Supervisor I', 'Supervisor II'],
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
  
  const [availablePositions, setAvailablePositions] = useState<PositionName[]>([]);
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
        body: JSON.stringify(formData)
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };
  const modalContentStyle: React.CSSProperties = {
    background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px',
    color: 'black', maxHeight: '90vh', overflowY: 'auto'
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Editar Dados de Trabalho</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="team">Equipe</label>
          <select id="team" name="team" value={formData.team} onChange={handleChange} required>
              <option value="Segurança">Segurança</option>
              <option value="Suporte">Suporte</option>
              <option value="Atendimento">Atendimento</option>
          </select>

          <label htmlFor="position">Cargo</label>
          <select id="position" name="position" value={formData.position} onChange={handleChange} required disabled={!formData.team}>
              <option value="">Selecione...</option>
              {availablePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
          
          <label htmlFor="shift">Turno</label>
          <select id="shift" name="shift" value={formData.shift} onChange={handleChange} required>
            <option value="">Selecione o Turno</option>
            <option value="06:00 às 14:00">Manhã (06:00-14:00)</option>
            <option value="14:00 às 22:00">Tarde (14:00-22:00)</option>
            <option value="22:00 às 06:00">Noite (22:00-06:00)</option>
          </select>

          <label htmlFor="weekdayOff">Folga da Semana</label>
          <select id="weekdayOff" name="weekdayOff" value={formData.weekdayOff} onChange={handleChange} required>
            <option value="">Selecione...</option>
            <option value="segunda-feira">Segunda</option>
            <option value="terça-feira">Terça</option>
            <option value="quarta-feira">Quarta</option>
            <option value="quinta-feira">Quinta</option>
            <option value="sexta-feira">Sexta</option>
          </select>
          
          <label htmlFor="initialWeekendOff">Folga Inicial do Fim de Semana</label>
          <select id="initialWeekendOff" name="initialWeekendOff" value={formData.initialWeekendOff} onChange={handleChange} required>
              <option value="">Selecione...</option>
              <option value="sábado">Sábado</option>
              <option value="domingo">Domingo</option>
          </select>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#6b7280'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}