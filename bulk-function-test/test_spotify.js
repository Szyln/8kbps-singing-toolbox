import fs from 'fs';
import csv from 'csv-parser';
import * as dotenv from 'dotenv';

dotenv.config();

// 音符對應表 (Spotify 的 0~11 對應 C 到 B)
const PITCH_CLASS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 解析調性 (例如：回傳 "C Major" 或 "F Minor")
function parseKey(key, mode) {
  if (key === -1 || key === undefined) return '';
  const root = PITCH_CLASS[key];
  const scale = mode === 1 ? 'Major' : 'Minor';
  return `${root} ${scale}`;
}

// 取得 Spotify Token
async function getSpotifyToken() {
  const auth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
}

// 第一個 API 請求：搜尋 Spotify 並取得基本資料與發行日期
async function searchSpotify(token, songName, artistName) {
  const query = encodeURIComponent(`track:${songName} artist:${artistName}`);
  const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();

  if (!data.tracks || data.tracks.items.length === 0) return null;

  const cleanTracks = data.tracks.items.filter(track => {
    const name = track.name.toLowerCase();
    return !name.includes('live') && 
           !name.includes('instrumental') && 
           !name.includes('cover') &&
           !name.includes('伴奏');
  });

  return cleanTracks.length > 0 ? cleanTracks[0] : data.tracks.items[0];
}

// 第二個 API 請求：取得 BPM 與 Key (音訊特徵)
async function getAudioFeatures(token, trackId) {
  const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return await response.json();
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('取得 Spotify Token 中...');
  const token = await getSpotifyToken();
  const results = [];

  fs.createReadStream('test_input.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`讀取到 ${results.length} 筆測試資料，開始向 Spotify 抓取資訊...\n`);
      
      // 表頭新增了 release_date, bpm, key
      let outputCsvString = '\uFEFFsong_name,artist_name,user_key,notes,status_id,role_ids,isrc,spotify_id,release_date,bpm,key,fetched_spotify_name\n';

      for (const row of results) {
        console.log(`🔍 搜尋: ${row.song_name} - ${row.artist_name}`);
        
        // 1. 取得基本資訊 (包含發行日期)
        const trackInfo = await searchSpotify(token, row.song_name, row.artist_name);
        
        const isrc = trackInfo ? trackInfo.external_ids?.isrc || '' : '';
        const spotifyId = trackInfo ? trackInfo.id : '';
        const releaseDate = trackInfo ? trackInfo.album.release_date : '';
        const fetchedName = trackInfo ? `${trackInfo.name} (${trackInfo.artists.map(a=>a.name).join(', ')})` : '查無此歌';

        let bpm = '';
        let keyStr = '';

        if (trackInfo) {
          // 2. 拿著抓到的 Spotify ID 去取得 BPM 與 Key
          const features = await getAudioFeatures(token, spotifyId);
          if (features) {
            bpm = Math.round(features.tempo); // 轉為整數
            keyStr = parseKey(features.key, features.mode);
          }
          console.log(`   ✅ 成功抓取: ${fetchedName} | 發行: ${releaseDate} | BPM: ${bpm} | Key: ${keyStr}`);
        } else {
          console.log(`   ❌ 查無此歌`);
        }

        outputCsvString += `"${row.song_name}","${row.artist_name}","${row.user_key || ''}","${row.notes || ''}","${row.status_id || '1'}","${row.role_ids || ''}","${isrc}","${spotifyId}","${releaseDate}","${bpm}","${keyStr}","${fetchedName}"\n`;
        
        // 每首歌需要打兩次 API，停頓時間稍微拉長以保護額度
        await delay(500); 
      }

      fs.writeFileSync('test_output.csv', outputCsvString);
      console.log('\n🎉 測試完成！請打開 test_output.csv 檢查抓取結果。');
    });
}

runTest();