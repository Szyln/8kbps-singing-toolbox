
import fs from 'fs';
import { loadEnv } from 'vite';
import process from 'process';

// 利用 Vite 內建的 loadEnv 讀取 .env 檔案
const env = loadEnv('development', process.cwd());

// 取得變數 (若專案 ID 沒放在 .env，也可以直接將 ID 寫死在這裡)
const projectId = env.VITE_SUPABASE_PROJECT_ID;
const key = env.SUPABASE_SEC_KEY;

async function fetchDocs() {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
      headers: { 'apikey': key }
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.text();
    fs.writeFileSync('./doc/supabase_api.json', data);
    console.log('API 文件更新完成！');
  } catch (error) {
    console.error('更新失敗:', error);
  }
}

fetchDocs();