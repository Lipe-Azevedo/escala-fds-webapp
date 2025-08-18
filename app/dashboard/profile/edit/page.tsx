'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './EditProfile.module.css';

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthday: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const currentUser = JSON.parse(userDataString);
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phoneNumber: currentUser.phoneNumber || '',
        birthday: currentUser.birthday ? currentUser.birthday.split('T')[0] : '',
        email: currentUser.email || '',
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.currentPassword) {
      setError('A sua senha atual é obrigatória para guardar qualquer alteração.');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('A nova senha e a confirmação não correspondem.');
      setIsLoading(false);
      return;
    }

    if (!user) {
      setError('Utilizador não encontrado.');
      setIsLoading(false);
      return;
    }

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      birthday: formData.birthday,
      currentPassword: formData.currentPassword,
    };

    if (formData.newPassword) {
      payload.newPassword = formData.newPassword;
    }

    try {
      const res = await fetch(`${apiURL}/api/users/${user.id}/personal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha ao atualizar o perfil.');
      }
      
      setSuccess('Perfil atualizado com sucesso! A redirecionar...');
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>A carregar perfil...</p>;
  }

  return (
    <div>
      <h1>Editar Perfil</h1>
      
      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div>
              <label htmlFor="firstName">Nome</label>
              <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="lastName">Sobrenome</label>
              <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
            </div>
            
            <div>
              <label htmlFor="birthday">Aniversário</label>
              <input id="birthday" name="birthday" type="date" value={formData.birthday} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="phoneNumber">Telefone</label>
              <input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} required />
            </div>

            <div className={styles.fullWidth}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={formData.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>

            <div className={styles.fullWidth}>
              <label htmlFor="currentPassword">Senha Atual (obrigatória para salvar)</label>
              <input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} required />
            </div>

            <div>
              <label htmlFor="newPassword">Nova Senha</label>
              <input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="Deixe em branco para não alterar" />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
            </div>
          </div>
          
          {error && <p style={{ color: '#f87171', textAlign: 'center', marginTop: '20px' }}>{error}</p>}
          {success && <p style={{ color: '#4ade80', textAlign: 'center', marginTop: '20px' }}>{success}</p>}

          <div className={styles.actions}>
            <Link href="/dashboard/profile">
              <button type="button" style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
            </Link>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}