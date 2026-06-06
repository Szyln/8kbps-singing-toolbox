import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../services/api';

export const useSongs = (page = 0, limit = 30) => {
  return useQuery({
    queryKey: ['songs', page, limit],
    queryFn: () => fetchSongs(page, limit), // 顯式呼叫以避免將 QueryFunctionContext 傳入 page 參數
    staleTime: 10 * 60 * 1000, // 10 分鐘內視為新鮮 (Hit Cache)
    retry: 2, // 失敗重試 2 次
  });
};
