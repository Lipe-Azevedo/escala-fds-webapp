'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Calendar from '../../components/Calendar'; // Importa o novo componente

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
      
      {/* Área para renderizar a tela específica de cada tipo de usuário */}
      <div style={{ marginTop: '30px' }}>
        {user.userType === 'master' ? <MasterView /> : <CollaboratorView user={user} />}
      </div>
    </div>
  );
}

// Visão do Master (pode ser desenvolvida depois)
const MasterView = () => {
  return <div><h2>Visão do Master</h2><p>Aqui você verá a lista de todos os colaboradores, equipes, etc.</p></div>;
}

// Visão do Colaborador agora renderiza o Calendário
const CollaboratorView = ({ user }: { user: User }) => {
  return (
    <div>
      <h2>Seu Calendário de Escala</h2>
      <Calendar user={user} />
    </div>
  );
}