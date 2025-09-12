'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';
import cardStyles from '@/components/common/Card.module.css';
import EyeIcon from '@/components/icons/EyeIcon';
import EyeOffIcon from '@/components/icons/EyeOffIcon';

export default function LoginPage() {
  useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password.trim(),
      };

      const res = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Email ou senha inválidos');
      }

      const data = await res.json();

      Cookies.set('authToken', data.token, { expires: 1, secure: process.env.NODE_ENV === 'production' });
      localStorage.setItem('userData', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordInputContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const passwordToggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    padding: '5px',
    cursor: 'pointer',
    color: 'var(--text-secondary-color)'
  };


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'rgb(var(--background-rgb))' }}>
      <div className={cardStyles.card} style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ marginBottom: '30px', display: 'inline-block' }}>
            <Image src="/logo-main.png" alt="EscalaFDS Logo" width={0} height={0} sizes="100vw" style={{ width: '60%', height: 'auto' }} priority />
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="password">Senha:</label>
            <div style={passwordInputContainerStyle}>
                <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{paddingRight: '45px'}}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={passwordToggleButtonStyle} aria-label="Mostrar/ocultar senha">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
          </div>
          {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '16px' }}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}