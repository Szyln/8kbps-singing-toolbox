import { supabase } from '../lib/supabase';
import { mapToSongItem, SongItem } from './adapters/songAdapter';

// 取得歌曲列表（分頁）
export const fetchSongs = async (page = 0, limit = 30): Promise<SongItem[]> => {
  // 計算起迄筆數
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('songs')
    .select('*, artists(*)')
    .range(from, to)      // 使用計算好的起迄範圍進行分頁
    .order('name');       // 排序以確保分頁順序一致

  if (error) {
    throw error;
  }

  // 將資料轉化為前端相容格式後回傳
  return (data || []).map(mapToSongItem);
};

// 新增客觀歌曲
export const createSong = async (songData: any) => {
  const { data, error } = await supabase
    .from('songs')
    .insert(songData)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// 更新客觀歌曲
export const updateSong = async (songId: string, songData: any) => {
  const { data, error } = await supabase
    .from('songs')
    .update(songData)
    .eq('song_id', songId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// 刪除歌曲
export const deleteSong = async (songId: string) => {
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('song_id', songId);

  if (error) {
    throw error;
  }
  return true;
};
