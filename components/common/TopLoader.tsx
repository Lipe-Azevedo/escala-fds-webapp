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
  
  useEffect(() => {
    // const handleStart = () => setIsLoading(true);
    // const handleComplete = () => setIsLoading(false);
    
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

export default function TopLoader() {
    return (
        <Suspense fallback={null}>
            <TopLoaderComponent />
        </Suspense>
    );
}