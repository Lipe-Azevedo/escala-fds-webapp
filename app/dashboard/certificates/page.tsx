'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Certificate, User } from '@/types';
import CertificateList from '@/components/CertificateList';
import SubmitCertificateModal from '@/components/SubmitCertificateModal';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchCertificates = async (currentUser: User) => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    let url = `${apiURL}/api/certificates`;
    if (currentUser.userType !== 'master') {
      url = `${apiURL}/api/certificates/user/${currentUser.id}`;
    }

    try {
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao buscar atestados.');
      const data: Certificate[] = await res.json();
      setCertificates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const currentUser = JSON.parse(userDataString);
      setUser(currentUser);
      fetchCertificates(currentUser);
    }
  }, []);

  const updateCertificateStatus = async (certificateId: number, status: 'approved' | 'rejected') => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/certificates/${certificateId}/status`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Falha ao atualizar status do atestado.');
        }
        if(user) fetchCertificates(user);
    } catch (err: any) {
        setError(err.message);
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Atestados Médicos</h1>
        {user.userType === 'collaborator' && (
            <button onClick={() => setModalOpen(true)}>+ Enviar Atestado</button>
        )}
      </div>

      {isLoading && <p>Carregando atestados...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <CertificateList certificates={certificates} currentUser={user} onApprove={updateCertificateStatus} onReject={updateCertificateStatus} />}

      {isModalOpen && (
        <SubmitCertificateModal 
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={() => { if(user) fetchCertificates(user); }}
        />
      )}
    </div>
  );
}