import { supabase } from '../lib/supabase';

// 取得某位使用者所有專屬主觀設定（如轉調、練習狀態、個人筆記）
export const getUserSongs = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_songs')
    .select('*, songs(*)')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
  return data;
};

// 儲存/更新使用者對特定歌曲的個人設定
export const saveUserSongSettings = async (userId: string, songId: string, settings: {
  user_key?: string;
  notes?: string;
  status_id?: number;
  role_ids?: number[];
}) => {
  const { data, error } = await supabase
    .from('user_songs')
    .upsert({
      user_id: userId,
      song_id: songId,
      status_id: settings.status_id ?? 1, // 預設 1 代表練習中
      user_key: settings.user_key,
      notes: settings.notes,
      role_ids: settings.role_ids
    }, { onConflict: 'user_id,song_id' })
    .select();

  if (error) {
    throw error;
  }
  return data;
};

// 刪除某筆個人歌曲設定
export const deleteUserSong = async (userSongId: string) => {
  const { error } = await supabase
    .from('user_songs')
    .delete()
    .eq('user_song_id', userSongId);

  if (error) {
    throw error;
  }
  return true;
};
