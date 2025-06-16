'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { TeamName, PositionName } from '../types';

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

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    team: '' as TeamName,
    position: '',
    shift: '',
    weekdayOff: '',
    initialWeekendOff: '',
    superiorId: 1,
  });
  
  const [availablePositions, setAvailablePositions] = useState<{ value: PositionName, label: string }[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAvailablePositions(positionsByTeam[formData.team] || []);
    setFormData(prev => ({ ...prev, position: '' }));
  }, [formData.team]);

  if (!isOpen) return null;

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
            userType: 'collaborator',
            superiorId: Number(formData.superiorId) || null,
        })
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao criar usuário.'); }

      onUserCreated();
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
    color: 'black', maxHeight: '90vh', overflowY: 'auto',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Criar Novo Colaborador</h2>
        <form onSubmit={handleSubmit}>
            <label htmlFor="firstName">Nome</label>
            <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nome" required />
            <label htmlFor="lastName">Sobrenome</label>
            <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Sobrenome" required />
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Senha" required />
            
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

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#6b7280'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Colaborador'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}