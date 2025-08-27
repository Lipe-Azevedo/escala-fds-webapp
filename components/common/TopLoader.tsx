'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './TopLoader.module.css';

function TopLoaderComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);
  
  // Este efeito é um fallback para o caso de a navegação demorar.
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Embora o Next.js cuide da renderização, podemos ouvir os eventos de navegação.
    // O ideal seria usar os eventos do router, mas para manter a simplicidade,
    // vamos nos basear na mudança de `pathname` e `searchParams` que já temos.
    // A chave aqui é o `Suspense` no layout.

    return () => {
      // Cleanup
    };
  }, []);


  return (
    <div className={styles.container}>
      <div className={`${styles.bar} ${isLoading ? styles.loading : ''}`} />
    </div>
  );
}

// Envolvemos o componente em Suspense para que ele possa reagir ao carregamento de outros componentes.
export default function TopLoader() {
    return (
        <Suspense fallback={null}>
            <TopLoaderComponent />
        </Suspense>
    );
}