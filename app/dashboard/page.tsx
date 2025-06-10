'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Calendar from '../../components/Calendar';
import CreateUserModal from '../../components/CreateUserModal'; // Importa o novo componente

// ... (Tipo User não muda)
type User = { id: number; firstName: string; lastName: string; email: string; userType: 'master' | 'collaborator'; team: string; position: string; shift: string; weekdayOff: string; initialWeekendOff: string; createdAt: string;};

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

// Visão do Master agora controla o modal de criação
const MasterView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserCreated = () => {
    // Aqui você pode, por exemplo, recarregar a lista de usuários
    console.log("Usuário criado com sucesso! Atualizar lista...");
  }

  return (
    <div>
      <h2>Visão do Master</h2>
      <p>Gerenciamento de colaboradores e equipes.</p>
      <button onClick={() => setIsModalOpen(true)} style={{marginTop: '10px'}}>
        Criar Novo Colaborador
      </button>

      <CreateUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
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