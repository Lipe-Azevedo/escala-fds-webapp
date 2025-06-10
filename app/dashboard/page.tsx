'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Calendar from '../../components/Calendar';
import CreateUserModal from '../../components/CreateUserModal';
import UserList from '../../components/UserList';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'master' | 'collaborator';
  team: string;
  position: string;
  shift: string;
  weekdayOff: string;
  initialWeekendOff: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('authToken');
    const userDataString = localStorage.getItem('userData');
    
    if (!token || !userDataString) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userDataString));
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Painel Principal</h1>
        <button onClick={handleLogout}>Sair (Logout)</button>
      </div>
      
      <h2>Bem-vindo(a), {user.firstName} {user.lastName}!</h2>
      
      <div style={{ marginTop: '30px' }}>
        {user.userType === 'master' ? <MasterView /> : <CollaboratorView user={user} />}
      </div>
    </div>
  );
}

// Visão do Master agora busca e exibe a lista de usuários
const MasterView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${apiURL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao buscar usuários.');
      const data = await res.json();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Visão do Master - Colaboradores</h2>
        <button onClick={() => setIsModalOpen(true)}>
          + Criar Novo Colaborador
        </button>
      </div>
      
      {isLoading && <p>Carregando lista de usuários...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <UserList users={users} />}

      {isModalOpen && (
        <CreateUserModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUserCreated={fetchUsers} // Atualiza a lista após criar um novo usuário
        />
      )}
    </div>
  );
}

// Visão do Colaborador continua a mesma
const CollaboratorView = ({ user }: { user: User }) => {
  return (
    <div>
      <h2>Seu Calendário de Escala</h2>
      <Calendar user={user} />
    </div>
  );
}