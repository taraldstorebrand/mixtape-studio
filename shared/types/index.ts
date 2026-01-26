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
  genre?: string;
  variationIndex?: number;
}

// Legacy interface for migration (D-041)
export interface LegacyHistoryItem {
  id: string;
  prompt: string;
  title: string;
  lyrics: string;
  createdAt: string;
  feedback?: 'up' | 'down';
  sunoJobId?: string;
  sunoStatus?: 'pending' | 'partial' | 'completed' | 'failed';
  sunoAudioUrls?: string[];
  sunoLocalUrls?: string[];
  genre?: string;
  sunoAudioUrl?: string;
}
