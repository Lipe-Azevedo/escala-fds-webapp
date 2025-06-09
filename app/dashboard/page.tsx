'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'master' | 'collaborator';
  team: string;
  position: string;
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
      
      <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px' }}>
        <h3>Suas Informações:</h3>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Tipo de Acesso:</strong> {user.userType}</p>
        
        {/* Mostra informações adicionais se for um colaborador */}
        {user.userType === 'collaborator' && (
          <>
            <p><strong>Equipe:</strong> {user.team || 'Não definido'}</p>
            <p><strong>Cargo:</strong> {user.position || 'Não definido'}</p>
          </>
        )}
      </div>

      {/* Área para renderizar a tela específica de cada tipo de usuário */}
      <div style={{ marginTop: '30px' }}>
        {user.userType === 'master' ? <MasterView /> : <CollaboratorView />}
      </div>
    </div>
  );
}

// Componente placeholder para a visão do Master
const MasterView = () => {
  return <div><h2>Visão do Master</h2><p>Aqui você verá a lista de todos os colaboradores, equipes, etc.</p></div>;
}

// Componente placeholder para a visão do Colaborador
const CollaboratorView = () => {
  return <div><h2>Visão do Colaborador</h2><p>Aqui você verá seu calendário de folgas, solicitações de troca, etc.</p></div>;
}