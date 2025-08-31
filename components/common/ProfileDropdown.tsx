'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import styles from './ProfileDropdown.module.css';
import ChevronIcon from '../icons/ChevronIcon';
import UserIcon from '../icons/UserIcon';
import LogOutIcon from '../icons/LogOutIcon';

interface ProfileDropdownProps {
  user: User | null;
  onLogout: () => void;
}

export default function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => {
    setIsClosing(true);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200); // Duração da animação
  };

  const openMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          closeMenu();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  return (
    <div className={styles.container} ref={dropdownRef}>
      {isOpen && (
        <div className={`${styles.menu} ${isClosing ? styles.menuClosing : ''}`}>
          <Link href="/dashboard/profile" className={styles.menuItem} onClick={closeMenu}>
            <UserIcon size={16} style={{ marginRight: '8px' }} />
            Perfil
          </Link>
          <button onClick={() => { onLogout(); closeMenu(); }} className={styles.menuItem}>
            <LogOutIcon size={16} style={{ marginRight: '8px' }} />
            Sair
          </button>
        </div>
      )}
      <button className={styles.button} onClick={toggleDropdown}>
        <div className={styles.userAvatar}>
          <UserIcon />
        </div>
        <ChevronIcon className={`${styles.chevron} ${isOpen && !isClosing ? styles.chevronOpen : ''}`} />
      </button>
    </div>
  );
}