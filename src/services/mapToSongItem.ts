export default function mapToSongItem(song: any) {
  const title = song.name || '';
  const author = song.artists?.map((a: any) => a.name).join(' ') || '';

  // 1. 【音域 (KeyTube) 搜尋連結】
  // 如果資料庫內有 explicit 填寫音域連結就用它，否則「自動動態生成」Google 搜尋 KeyTube 的 URL！
  let diffUrl = '';
  if (song.medias && song.medias[1]) {
    diffUrl = song.medias[1];
  } else if (title) {
    // 相當於：https://www.google.com/search?q=作者+歌名+site:keytube.net
    const searchQuery = encodeURIComponent(`${author} ${title} site:keytube.net`.trim());
    diffUrl = `https://www.google.com/search?q=${searchQuery}`;
  }

  // 2. 【Youtube 搜尋連結】
  // 如果資料庫有填寫 Youtube 連結就用它，否則「自動動態生成」Youtube 關鍵字搜尋 URL！
  let ytUrl = '';
  if (song.medias && song.medias[0]) {
    ytUrl = song.medias[0];
  } else if (title) {
    // 相當於：https://www.youtube.com/results?search_query=歌名+作者
    const searchQuery = encodeURIComponent(`${title} ${author}`.trim().replace(/\s+/g, '+'));
    ytUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  }

  return {
    "曲名": { text: title },
    "作者": { text: song.artists?.map((a: any) => a.name).join(', ') || '' },
    "Key": song.key ? { text: song.key } : undefined,
    "コード": song.chord_link ? { text: 'コード', url: song.chord_link } : undefined,
    "完成度": { text: '已設定' }, // 未來可以跟 user_songs 做連動
    "ジャンル": { text: song.genre_id ? String(song.genre_id) : '未分類' },
    
    // 🌟 輸出經過適配器動態處理好的連結
    "Youtube": ytUrl ? { text: 'Youtube', url: ytUrl } : undefined,
    "音域": diffUrl ? { text: 'KeyTube', url: diffUrl } : undefined,
  };
}
