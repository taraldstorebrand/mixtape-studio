export interface HistoryItem {
  id: string;
  prompt: string;
  lyrics: string;
  createdAt: string;
  feedback?: 'up' | 'down';
  sunoJobId?: string;
  sunoStatus?: 'pending' | 'partial' | 'completed' | 'failed';
  sunoAudioUrls?: string[];
  sunoLocalUrls?: string[];
  genre?: string;
  // Legacy field for backward compatibility - will be migrated
  sunoAudioUrl?: string;
}
