import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSongs } from '../../hooks/useSongs';
import {
  extractUsersFromSongs,
  parseUserIds,
  buildUserIdsPath,
  toggleUser,
} from '../../utils/users';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserIds?: string[]; // already parsed from URL
}

const X_URL = 'https://x.com/aquasf16';
const YT_URL = 'https://www.youtube.com/@8kbps';

export default function Sidebar({ isOpen, onClose, currentUserIds = [] }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: songs } = useSongs();

  // Pin functionality state
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('sidebarPinned') === 'true';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('appTheme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('appTheme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('sidebarPinned', String(isPinned));
  }, [isPinned]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const toggleLang = () => {
    const newLang = i18n.language === 'ja' ? 'zh-TW' : 'ja';
    i18n.changeLanguage(newLang);
    localStorage.setItem('appLang', newLang);
  };


  const isListPage = location.pathname.endsWith('/list');
  const isWhichLinePage = location.pathname === '/tool/which-line';

  // Combined users for "User" filter
  const singers = songs ? extractUsersFromSongs(songs, 'Singer') : [];
  const players = songs ? extractUsersFromSongs(songs, 'Player') : [];
  const allUsers = songs ? extractUsersFromSongs(songs, 'User') : [];

  // Handle toggling a user selection: updates URL
  const handleToggleUser = (userId: string) => {
    let next: string[];
    
    if (currentUserIds.includes(userId)) {
      // Already selected: "Click twice" logic -> change to single select this user
      next = [userId];
    } else {
      // Standard toggle: add to existing selection
      next = toggleUser(currentUserIds, userId);
    }

    navigate(next.length === 0 ? '/' : `/${buildUserIdsPath(next)}/list`);
    if (!isPinned) onClose();
  };

  const isUserSelected = (userId: string) => currentUserIds.includes(userId);



  // Render a single user item (shared between Singer & Player)
  const renderUserItem = (u: string) => {
    const selected = isUserSelected(u);
    return (
      <button
        key={u}
        className={`${styles.drawerItem} ${styles.userItem} ${selected ? styles.active : ''}`}
        onClick={() => handleToggleUser(u)}
      >
        <span className={`material-symbols-outlined ${styles.userIcon}`}>
          {selected ? 'check_circle' : 'radio_button_unchecked'}
        </span>
        <span>{u}</span>
      </button>
    );
  };


  return (
    <>
      <div
        className={`${styles.drawerBackdrop} ${isOpen ? styles.active : ''}`}
        onClick={onClose}
      />
      
      <nav className={`${styles.navDrawer} ${isOpen ? styles.active : ''}`}>
        <div className={styles.drawerHeader}>
          <button 
            className={`${styles.drawerCloseBtn} ${isPinned ? styles.active : ''}`} 
            onClick={() => setIsPinned(!isPinned)}
          >
            <span className="material-symbols-outlined">{isPinned ? 'push_pin' : 'keep_public'}</span>
          </button>
          <button className={styles.drawerCloseBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className={styles.drawerContent}>
          {/* ── User 大類 ── */}
          <div className={styles.categoryTitle}>{t('sidebar.userCategory', 'User')}</div>

          {/* Singer 子分類 */}
          {singers.length > 0 && (
            <>
              <div className={styles.subCategoryTitle}>{t('sidebar.singerCategory', 'Singer')}</div>
              {singers.map(renderUserItem)}
            </>
          )}

          {/* Player 子分類 */}
          {players.length > 0 && (
            <>
              <div className={styles.subCategoryTitle}>{t('sidebar.playerCategory', 'Player')}</div>
              {players.map(renderUserItem)}
            </>
          )}

          {singers.length === 0 && players.length === 0 && (
            <div style={{ padding: '0 20px 8px', color: 'var(--text-sub)', fontSize: '0.9em' }}>
              {t('loading')}
            </div>
          )}

          {/* ── Tool 大類 ── */}
          <div className={styles.categoryTitle} style={{ marginTop: 20 }}>
            {t('sidebar.toolCategory', 'Tool')}
          </div>
          <button
            className={`${styles.drawerItem} ${isWhichLinePage ? styles.active : ''}`}
            onClick={() => { navigate('/tool/which-line'); onClose(); }}
          >
            <span className="material-symbols-outlined">format_list_numbered</span>
            <span>{t('sidebar.menuTool', '行數工具')}</span>
          </button>
        </div>

        {/* Footer: social + theme + lang */}
        <div className={styles.drawerFooter}>
          <a href={X_URL} target="_blank" rel="noreferrer" className={styles.socialIcon} title="X (Twitter)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href={YT_URL} target="_blank" rel="noreferrer" className={`${styles.socialIcon} ${styles.yt}`} title="YouTube">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M21.582 6.186a2.684 2.684 0 0 0-1.884-1.895C17.973 3.846 12 3.846 12 3.846s-5.973 0-7.698.445a2.684 2.684 0 0 0-1.884 1.895C1.964 7.915 1.964 12 1.964 12s0 4.085.454 5.814a2.684 2.684 0 0 0 1.884 1.895c1.725.445 7.698.445 7.698.445s5.973 0 7.698-.445a2.684 2.684 0 0 0 1.884-1.895c.454-1.729.454-5.814.454-5.814s0-4.085-.454-5.814zM9.96 15.485V8.515L15.96 12l-6 3.485z"/>
            </svg>
          </a>
          <div className={styles.footerActions}>
            <button className={styles.footerBtn} onClick={toggleTheme} title="Toggle Theme">
              <span className="material-symbols-outlined">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button className={styles.footerBtn} onClick={toggleLang}>
              <span className="material-symbols-outlined">translate</span>
              <span>{i18n.language === 'ja' ? '中文' : '日本語'}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
