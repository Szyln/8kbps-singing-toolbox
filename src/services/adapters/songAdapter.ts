export interface SongField {
  text: string;
  url?: string;
}

export interface SongItem {
  "曲名": SongField;
  "作者"?: SongField;
  "完成度"?: SongField;
  "ジャンル"?: SongField;
  "Key"?: SongField;
  "コード"?: SongField;
  "橫斷検索"?: SongField;
  "音域"?: SongField;
  "Youtube"?: SongField;
  "User"?: SongField;
  "Singer"?: SongField;
  "Player"?: SongField;
}

export function mapToSongItem(song: any): SongItem {
  const title = song.name || '';
  // Combine all associated artists into a comma-separated string
  const author = song.artists?.map((a: any) => a.name).join(', ') || '';
  const searchAuthor = song.artists?.map((a: any) => a.name).join(' ') || '';

  // 1. 【音域 (KeyTube) 搜尋連結】
  // 如果資料庫內有 explicit 填寫音域連結就用它，否則「自動動態生成」Google 搜尋 KeyTube 的 URL！
  let diffUrl = '';
  if (song.medias && song.medias[1]) {
    diffUrl = song.medias[1];
  } else if (title) {
    const searchQuery = encodeURIComponent(`${searchAuthor} ${title} site:keytube.net`.trim());
    diffUrl = `https://www.google.com/search?q=${searchQuery}`;
  }

  // 2. 【Youtube 搜尋連結】
  // 如果資料庫有填寫 Youtube 連結就用它，否則「自動動態生成」Youtube 關鍵字搜尋 URL！
  let ytUrl = '';
  if (song.medias && song.medias[0]) {
    ytUrl = song.medias[0];
  } else if (title) {
    const searchQuery = encodeURIComponent(`${title} ${searchAuthor}`.trim().replace(/\s+/g, '+'));
    ytUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  }

  return {
    "曲名": { text: title },
    "作者": { text: author },
    "Key": song.key ? { text: song.key } : undefined,
    "コード": song.chord_link ? { text: 'コード', url: song.chord_link } : undefined,
    "完成度": { text: '已設定' }, // 預設值，後續會搭配 user_songs 動態關聯
    "ジャンル": { text: song.genre_id ? String(song.genre_id) : '未分類' },
    "Youtube": ytUrl ? { text: 'Youtube', url: ytUrl } : undefined,
    "音域": diffUrl ? { text: 'KeyTube', url: diffUrl } : undefined,
  };
}
