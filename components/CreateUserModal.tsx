'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type TeamName = 'Security' | 'Support' | 'CustomerService' | '';
type PositionName = string;

const positionsByTeam: Record<TeamName, PositionName[]> = {
  'Security': ['Security', 'Supervisor I', 'Supervisor II'],
  'Support': ['Backend Developer', 'Frontend Developer'],
  'CustomerService': ['Attendant', 'Supervisor I', 'Supervisor II'],
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
  
  const [availablePositions, setAvailablePositions] = useState<PositionName[]>([]);
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

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Criar Novo Colaborador</h2>
        <form onSubmit={handleSubmit}>
          <fieldset style={fieldsetStyle}>
            <legend>Informações Pessoais</legend>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstName">Nome</label>
                <input style={inputStyle} id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nome" required />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="lastName">Sobrenome</label>
                <input style={inputStyle} id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Sobrenome" required />
              </div>
            </div>
            <label htmlFor="email">Email</label>
            <input style={inputStyle} id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <label htmlFor="password">Senha</label>
            <input style={inputStyle} id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Senha" required />
            <label htmlFor="phoneNumber">Telefone</label>
            <input style={inputStyle} id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Telefone" />
          </fieldset>
          
          <fieldset style={fieldsetStyle}>
            <legend>Informações de Trabalho</legend>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                    <label htmlFor="team">Equipe</label>
                    <select style={inputStyle} id="team" name="team" value={formData.team} onChange={handleChange} required>
                        <option value="">Selecione...</option>
                        <option value="Security">Segurança</option>
                        <option value="Support">Suporte</option>
                        <option value="CustomerService">Atendimento</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label htmlFor="position">Cargo</label>
                    <select style={inputStyle} id="position" name="position" value={formData.position} onChange={handleChange} required disabled={!formData.team}>
                        <option value="">Selecione...</option>
                        {availablePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                </div>
            </div>
            <label htmlFor="shift">Turno</label>
            <select style={inputStyle} id="shift" name="shift" value={formData.shift} onChange={handleChange} required>
              <option value="">Selecione o Turno</option>
              <option value="06:00-14:00">Manhã (06:00-14:00)</option>
              <option value="14:00-22:00">Tarde (14:00-22:00)</option>
              <option value="22:00-06:00">Noite (22:00-06:00)</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                    <label htmlFor="weekdayOff">Folga da Semana</label>
                    <select style={inputStyle} id="weekdayOff" name="weekdayOff" value={formData.weekdayOff} onChange={handleChange} required>
                        <option value="">Selecione...</option>
                        <option value="monday">Segunda</option>
                        <option value="tuesday">Terça</option>
                        <option value="wednesday">Quarta</option>
                        <option value="thursday">Quinta</option>
                        <option value="friday">Sexta</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label htmlFor="initialWeekendOff">Folga do Próximo Fim de Semana</label>
                    <select style={inputStyle} id="initialWeekendOff" name="initialWeekendOff" value={formData.initialWeekendOff} onChange={handleChange} required>
                        <option value="">Selecione...</option>
                        <option value="saturday">Sábado</option>
                        <option value="sunday">Domingo</option>
                    </select>
                </div>
            </div>
          </fieldset>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px' }}>Cancelar</button>
            <button type="submit" disabled={isLoading} style={{ padding: '8px 12px', fontWeight: 'bold' }}>{isLoading ? 'Salvando...' : 'Salvar Colaborador'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilos
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalContentStyle: React.CSSProperties = {
  background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px',
  color: 'black',
  maxHeight: '90vh',
  overflowY: 'auto',
};
const fieldsetStyle: React.CSSProperties = {
  border: '1px solid #ddd', borderRadius: '4px', padding: '15px', margin: '10px 0'
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px', marginTop: '5px', marginBottom: '10px', boxSizing: 'border-box',
  border: '1px solid #ccc', borderRadius: '4px'
};