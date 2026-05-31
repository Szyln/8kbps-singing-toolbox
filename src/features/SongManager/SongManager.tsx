import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SongItem } from '../../types/Song';
import SearchBar from './components/SearchBar/SearchBar';
import Filters from './components/Filters/Filters';
import Tabs from './components/Tabs/Tabs';
import SongCard from './components/SongCard/SongCard';
import { isFuzzyMatch, getCompLevel } from '../../utils/search';
import { parseUserIds } from '../../utils/users';
import styles from './SongManager.module.css';

interface SongManagerProps {
  songs: SongItem[];
}

export default function SongManager({ songs }: SongManagerProps) {
  const { t } = useTranslation();
  const { userIds: userIdsParam } = useParams<{ userIds: string }>();

  const currentUserIds = useMemo(() => 
    userIdsParam ? parseUserIds(userIdsParam) : [], 
    [userIdsParam]
  );
  
  const [viewMode, setViewMode] = useState<'genre' | 'completion'>('genre');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [availableCompletions, setAvailableCompletions] = useState<Set<string>>(new Set());
  const [availableGenres, setAvailableGenres] = useState<Set<string>>(new Set());
  
  const [selectedCompletions, setSelectedCompletions] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  
  const [currentTab, setCurrentTab] = useState<string>('');
  
  const [isSingleSelectMode, setIsSingleSelectMode] = useState(false);
  const [lastClickedLevel, setLastClickedLevel] = useState(-1);

  // 初始化可用的篩選選項
  useEffect(() => {
    const comps = new Set<string>();
    const genres = new Set<string>();
    
    songs.forEach(song => {
      if (song['完成度']?.text?.trim()) {
        comps.add(song['完成度'].text.trim());
      }
      if (song['ジャンル']?.text?.trim()) {
        const gList = song['ジャンル'].text.split(/[,、]/).map(g => g.trim()).filter(Boolean);
        gList.forEach(g => genres.add(g));
      }
    });
    
    setAvailableCompletions(comps);
    setAvailableGenres(genres);
    
    // 初始化預設過濾 (>= 4)
    const initialComps = Array.from(comps).filter(c => getCompLevel(c) >= 4);
    setSelectedCompletions(initialComps.length > 0 ? initialComps : Array.from(comps));
  }, [songs]);

  const handleToggleCompletion = (comp: string) => {
    const clickedLevel = getCompLevel(comp);
    let newComps: string[] = [];
    
    if (clickedLevel === lastClickedLevel && !isSingleSelectMode) {
      setIsSingleSelectMode(true);
      newComps = [comp];
    } else {
      setIsSingleSelectMode(false);
      setLastClickedLevel(clickedLevel);
      newComps = Array.from(availableCompletions).filter(c => getCompLevel(c) >= clickedLevel);
    }
    setSelectedCompletions(newComps);
  };

  const handleToggleViewMode = () => {
    setViewMode(prev => prev === 'genre' ? 'completion' : 'genre');
    setSelectedGenre('all');
    
    // 重設預設 Completion
    const initialComps = Array.from(availableCompletions).filter(c => getCompLevel(c) >= 4);
    setSelectedCompletions(initialComps.length > 0 ? initialComps : Array.from(availableCompletions));
    
    setIsSingleSelectMode(false);
    setLastClickedLevel(-1);
    setCurrentTab(''); // 重設 tab
  };

  // 過濾資料
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const title = song['曲名']?.text || '';
      const author = song['作者']?.text || '';
      
      const matchSearch = isFuzzyMatch(title, searchQuery) || isFuzzyMatch(author, searchQuery);
      
      // User Filter Logic: 檢查歌曲的 Singer 或 Player 是否包含所有選取的 User
      let matchUser = true;
      if (currentUserIds.length > 0) {
        const songUsers = new Set<string>();
        (['Singer', 'Player'] as const).forEach(f => {
          const raw = song[f]?.text?.trim();
          if (raw) {
            raw.split(/[,、]/)
              .map(u => u.trim())
              .filter(Boolean)
              .forEach(u => songUsers.add(u));
          }
        });
        matchUser = currentUserIds.every(id => songUsers.has(id));
      }

      let matchFilter = true;
      if (viewMode === 'genre') {
        const comp = song['完成度']?.text?.trim() || '';
        matchFilter = selectedCompletions.includes(comp);
      } else {
        if (selectedGenre !== 'all') {
          const genresRaw = song['ジャンル']?.text || '';
          const genres = genresRaw.split(/[,、]/).map(g => g.trim());
          matchFilter = genres.includes(selectedGenre);
        }
      }
      
      return matchSearch && matchFilter && matchUser;
    });
  }, [songs, searchQuery, viewMode, selectedCompletions, selectedGenre, currentUserIds]);

  // 群組與排序
  const { tabList, parsedData } = useMemo(() => {
    const data: Record<string, Record<string, SongItem[]>> = {};
    const tabSet = new Set<string>();

    filteredSongs.forEach(song => {
      const genresRaw = song['ジャンル']?.text?.trim() || '未分類';
      const authorsRaw = song['作者']?.text?.trim() || '未分類';
      const compRaw = song['完成度']?.text?.trim() || '未設定';

      const genres = genresRaw.split(/[,、]/).map(g => g.trim()).filter(Boolean);
      const authors = authorsRaw.split(/[,、]/).map(a => a.trim()).filter(Boolean);

      if (viewMode === 'genre') {
        genres.forEach(genre => {
          tabSet.add(genre);
          if (!data[genre]) data[genre] = {};
          authors.forEach(author => {
            if (!data[genre][author]) data[genre][author] = [];
            data[genre][author].push(song);
          });
        });
      } else {
        tabSet.add(compRaw);
        if (!data[compRaw]) data[compRaw] = {};
        authors.forEach(author => {
          if (!data[compRaw][author]) data[compRaw][author] = [];
          data[compRaw][author].push(song);
        });
      }
    });

    let tabs = Array.from(tabSet);
    if (viewMode === 'genre') {
      tabs.sort();
    } else {
      tabs.sort((a, b) => b.localeCompare(a));
    }

    // 將內部歌曲排序
    for (const t in data) {
      for (const sub in data[t]) {
        if (viewMode === 'genre') {
          data[t][sub].sort((a, b) => {
            const cA = String(a['完成度']?.text || '');
            const cB = String(b['完成度']?.text || '');
            return cB.localeCompare(cA);
          });
        } else {
          data[t][sub].sort((a, b) => {
            const gA = String(a['ジャンル']?.text || '');
            const gB = String(b['ジャンル']?.text || '');
            return gA.localeCompare(gB);
          });
        }
      }
    }

    return { tabList: tabs, parsedData: data };
  }, [filteredSongs, viewMode]);

  // 設定預設 active tab
  useEffect(() => {
    if (tabList.length > 0 && !tabList.includes(currentTab)) {
      setCurrentTab(tabList[0]);
    }
  }, [tabList, currentTab]);

  const activeData = parsedData[currentTab] || {};
  const subGroups = Object.keys(activeData).sort();

  return (
    <>
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        candidates={filteredSongs}
      />
      
      <Filters 
        viewMode={viewMode}
        availableCompletions={Array.from(availableCompletions)}
        selectedCompletions={selectedCompletions}
        onToggleCompletion={handleToggleCompletion}
        availableGenres={Array.from(availableGenres)}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
      />
      
      <Tabs 
        tabList={tabList}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
      />

      <div className={styles.gridContainer}>
        {tabList.length === 0 ? (
          <div className={styles.noData}>{t('noData', '条件に一致する曲がありません。')}</div>
        ) : (
          subGroups.map(subGroupName => (
            <div key={subGroupName} className={styles.groupCard}>
              <h3 className={styles.groupTitle}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '1.2em' }}>person</span> {subGroupName}
              </h3>
              <ul className="song-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeData[subGroupName].map((song, i) => (
                  <SongCard key={i} song={song} viewMode={viewMode} />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </>
  );
}
