import { supabase } from '../lib/supabase';

// 取得歌手列表
export const getArtists = async () => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }
  return data;
};

// 新增歌手
export const createArtist = async (artistData: any) => {
  const { data, error } = await supabase
    .from('artists')
    .insert(artistData)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// 關聯歌曲與歌手
export const associateSongArtist = async (songId: string, artistId: string) => {
  const { error } = await supabase
    .from('song_artists')
    .insert({ song_id: songId, artist_id: artistId });

  if (error) {
    throw error;
  }
  return true;
};
