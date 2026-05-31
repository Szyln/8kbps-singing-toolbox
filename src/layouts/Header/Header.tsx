import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Header.module.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export default function Header({ onToggleSidebar, title }: HeaderProps) {
  const { t: _t } = useTranslation(); // keep i18n context loaded

  // Init theme on mount (theme is managed in Sidebar now, but we apply it here)
  useEffect(() => {
    const saved = localStorage.getItem('appTheme');
    const isDark = saved ? saved === 'dark' : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  return (
    <div className={styles.controlsHeader}>
      <div className={styles.headerTitleWrapper}>
        <button
          className={`${styles.actionBtn} ${styles.iconOnly} ${styles.menuToggle}`}
          onClick={onToggleSidebar}
          title="Toggle Menu"
        >
          <span className={`material-symbols-outlined ${styles.menuIcon}`}>menu</span>
        </button>
        <h1 className={styles.headerTitle}>{title}</h1>
      </div>
    </div>
  );
}
