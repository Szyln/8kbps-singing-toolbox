import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// 1. 設定 CORS 標頭 (允許前端跨站呼叫)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 開發期先用 *，前端上線後請改為正式網域如 'https://yourdomain.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 2. 攔截瀏覽器的 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 3. 取得前端傳來的搜尋關鍵字
    const { query } = await req.json()
    if (!query) throw new Error('請提供搜尋關鍵字')

    // 4. 從環境變數安全讀取 Spotify 金鑰
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')

    // 5. 取得 Spotify Access Token
    const auth = btoa(`${clientId}:${clientSecret}`) // Deno 原生的 base64 編碼
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenRes.json()
    const token = tokenData.access_token

    // 6. 呼叫 Spotify Search API
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const searchData = await searchRes.json()

    if (!searchData.tracks || searchData.tracks.items.length === 0) {
      return new Response(
        JSON.stringify([]), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 7. 過濾掉伴奏與 Live 版，並整理成前端需要的乾淨格式
    const cleanTracks = searchData.tracks.items.filter((track: any) => {
      const name = track.name.toLowerCase()
      return !name.includes('live') && !name.includes('instrumental') && !name.includes('cover') && !name.includes('伴奏')
    })

    const finalTracks = cleanTracks.length > 0 ? cleanTracks : [searchData.tracks.items[0]]

    // 重組資料結構，只傳回前端需要的欄位
    const formattedResults = finalTracks.map((track: any) => ({
      name: track.name,
      artist_names: track.artists.map((a: any) => a.name),
      isrc: track.external_ids?.isrc || null,
      spotify_id: track.id,
      release_date: track.album.release_date
    }))

    // 8. 回傳結果給前端
    return new Response(
      JSON.stringify(formattedResults),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})