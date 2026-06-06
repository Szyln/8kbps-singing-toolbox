import { supabase } from '../lib/supabase';

// 取得使用者設定檔
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw error;
  }
  return data;
};

// 儲存/更新使用者設定檔
export const saveUserProfile = async (userId: string, profileData: { name: string; social?: any }) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      user_id: userId,
      ...profileData
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};
