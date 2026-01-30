export interface HistoryItem {
  id: string;
  prompt: string;
  title: string;
  lyrics: string;
  createdAt: string;
  feedback?: 'up' | 'down';
  sunoJobId?: string;
  sunoClipId?: string;
  sunoStatus?: 'pending' | 'completed' | 'failed';
  sunoAudioUrl?: string;
  sunoLocalUrl?: string;
  sunoImageUrl?: string;
  genre?: string;
  artist?: string;
  album?: string;
  variationIndex?: number;
  isUploaded?: boolean;
  duration?: number;
}
