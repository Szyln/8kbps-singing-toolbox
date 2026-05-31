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
