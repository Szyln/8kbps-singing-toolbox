import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SongItem } from '../../../../types/Song';
import { isFuzzyMatch } from '../../../../utils/search';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  viewMode?: 'genre' | 'completion';
  onToggleViewMode?: () => void;
  candidates: (SongItem | string)[];
  onSelect?: (val: string) => void;
}

export default function SearchBar({
  value,
  onChange,
  viewMode,
  onToggleViewMode,
  candidates,
  placeholder,
  onSelect
}: SearchBarProps) {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (title: string) => {
    onChange(title);
    if (onSelect) onSelect(title);
    setShowDropdown(false);
  };

  const displayCandidates = useMemo(() => {
    if (!value.trim()) return [];
    return candidates
      .filter(item => {
        const isString = typeof item === 'string';
        const title = isString ? item : (item['曲名']?.text || '');
        const author = isString ? '' : (item['作者']?.text || '');
        return isFuzzyMatch(title, value) || isFuzzyMatch(author, value);
      })
      .slice(0, 50);
  }, [candidates, value]);

  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchWrapper} ref={wrapperRef}>
        <input
          type="text"
          className={styles.searchInput}
          value={value}
          onChange={handleInput}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder || t('searchPlaceholder', '曲名、作者で検索...')}
          autoComplete="off"
        />
        <div className={`${styles.candidatesDropdown} ${showDropdown && value && displayCandidates.length > 0 ? styles.show : ''}`}>
          {displayCandidates.map((item, i) => {
            const isString = typeof item === 'string';
            const title = isString ? item : (item['曲名']?.text || '');
            const author = isString ? '' : (item['作者']?.text || '');
            return (
              <div key={i} className={styles.candidateItem} onClick={() => handleSelect(title)}>
                <div className={styles.candidateTitle}>{title}</div>
                {!isString && author && (
                  <div className={styles.candidateAuthor}>
                    <span className="material-symbols-outlined">person</span> {author}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {viewMode && onToggleViewMode && (
        <button className={styles.viewToggleBtn} onClick={onToggleViewMode}>
          <span className="material-symbols-outlined">swap_horiz</span>
          <span>{viewMode === 'genre' ? t('switchToCompletion', '完成度別へ') : t('switchToGenre', 'ジャンル別へ')}</span>
        </button>
      )}
    </div>
  );
}
