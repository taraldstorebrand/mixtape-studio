/**
 * Migration script for D-041: One history item per song variation
 *
 * This script migrates old history items (with sunoAudioUrls arrays) to the new format
 * where each song variation is a separate history item.
 *
 * USAGE:
 * 1. Import this file in App.tsx: import './services/migration-v041';
 * 2. Run the app once to migrate localStorage data
 * 3. Delete this file and remove the import from App.tsx
 */

import { HistoryItem, LegacyHistoryItem } from '../types';

const STORAGE_KEY = 'sangtekst_history';

function runMigration(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const legacyHistory: LegacyHistoryItem[] = JSON.parse(stored);
    const newHistory: HistoryItem[] = [];
    let migrationNeeded = false;

    for (const item of legacyHistory) {
      // Check if item needs migration (has array fields)
      const hasArrayUrls = item.sunoAudioUrls && item.sunoAudioUrls.length > 0;
      const hasArrayLocalUrls = item.sunoLocalUrls && item.sunoLocalUrls.length > 0;
      const hasLegacySingleUrl = item.sunoAudioUrl && !hasArrayUrls;

      if (hasArrayUrls || hasArrayLocalUrls) {
        migrationNeeded = true;

        // Determine number of variations from the arrays
        const audioUrls = item.sunoAudioUrls || [];
        const localUrls = item.sunoLocalUrls || [];
        const variationCount = Math.max(audioUrls.length, localUrls.length);

        // Create separate history items for each variation
        for (let i = 0; i < variationCount; i++) {
          const newItem: HistoryItem = {
            id: `${item.id}_${i}`, // Create unique ID for each variation
            prompt: item.prompt,
            title: item.title,
            lyrics: item.lyrics,
            createdAt: item.createdAt,
            feedback: item.feedback,
            sunoJobId: item.sunoJobId,
            sunoStatus: item.sunoStatus === 'partial' ? 'pending' : (item.sunoStatus as 'pending' | 'completed' | 'failed'),
            sunoAudioUrl: audioUrls[i],
            sunoLocalUrl: localUrls[i],
            genre: item.genre,
            variationIndex: i,
          };
          newHistory.push(newItem);
        }
      } else if (hasLegacySingleUrl) {
        // Handle very old format with single sunoAudioUrl
        migrationNeeded = true;
        const newItem: HistoryItem = {
          id: item.id,
          prompt: item.prompt,
          title: item.title,
          lyrics: item.lyrics,
          createdAt: item.createdAt,
          feedback: item.feedback,
          sunoJobId: item.sunoJobId,
          sunoStatus: item.sunoStatus === 'partial' ? 'pending' : (item.sunoStatus as 'pending' | 'completed' | 'failed'),
          sunoAudioUrl: item.sunoAudioUrl,
          genre: item.genre,
          variationIndex: 0,
        };
        newHistory.push(newItem);
      } else {
        // Item is already in new format or has no audio
        const newItem: HistoryItem = {
          id: item.id,
          prompt: item.prompt,
          title: item.title,
          lyrics: item.lyrics,
          createdAt: item.createdAt,
          feedback: item.feedback,
          sunoJobId: item.sunoJobId,
          sunoStatus: item.sunoStatus === 'partial' ? 'pending' : (item.sunoStatus as 'pending' | 'completed' | 'failed'),
          genre: item.genre,
        };
        newHistory.push(newItem);
      }
    }

    if (migrationNeeded) {
      // Sort by createdAt to maintain chronological order
      newHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Limit to 100 items
      const limitedHistory = newHistory.slice(0, 100);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
      console.log(`[Migration D-041] Migrated ${legacyHistory.length} items to ${limitedHistory.length} items`);
    } else {
      console.log('[Migration D-041] No migration needed');
    }
  } catch (error) {
    console.error('[Migration D-041] Migration failed:', error);
  }
}

// Run migration immediately when this module is imported
runMigration();
