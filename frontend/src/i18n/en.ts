export const en = {
  actions: {
    generateSong: 'Generate song',
    generatingSong: 'Generating song... (1-5 min)',
    generateLyrics: 'Generate lyrics',
    generatingLyrics: 'Generating lyrics...',
    createMixtape: 'Create Mixtape',
    creatingMixtape: 'Creating mixtape...',
    makeMixtapeFromLiked: 'Create mixtape from liked songs',
    makeMixtape: (count: number, duration?: string) =>
      duration
        ? `Create mixtape (${count} songs · ${duration})`
        : `Create mixtape (${count} songs)`,
    uploadMp3: 'Upload MP3',
    uploading: 'Uploading...',
    uploadFiles: (count: number) =>
      `Upload ${count} file${count > 1 ? 's' : ''}`,
    cancel: 'Cancel',
    copy: 'Copy',
    newDraft: '← New draft',
    advanced: 'Advanced',
    close: 'Close',
  },

  labels: {
    songTitle: 'Song title (required):',
    lyrics: 'Lyrics:',
    genreStyle: 'Genre/style (optional):',
    chatGptPrompt: 'ChatGPT prompt:',
    title: 'Title:',
    genre: 'Genre:',
    useAiToGenerateLyrics: 'Use AI to generate lyrics',
  },

  placeholders: {
    enterSongTitle: 'Enter song title...',
    writeLyricsHere: 'Write the lyrics here...',
    selectOrWriteGenre: 'Select or type genre...',
    promptForLyrics: "Write a prompt for the lyrics (e.g. 'A song about summer')",
    searchForSongs: 'Search for songs...',
  },

  headings: {
    selectedSong: 'Selected song',
    availableSongs: 'Available songs',
    yourMixtape: 'Your mixtape',
  },

  tooltips: {
    previous: 'Previous',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    clear: 'Clear',
    removeFromHistory: 'Remove from history',
    addToMixtape: 'Add to mixtape',
    removeFromMixtape: 'Remove from mixtape',
    dragToReorder: 'Drag to reorder',
    thumbsUp: 'Thumbs up',
    thumbsDown: 'Thumbs down',
    delete: 'Delete',
    remove: 'Remove',
    createAdvancedMixtape: 'Create advanced mixtape',
    noSongsAvailable: 'No songs available',
  },

  messages: {
    noPrompt: '(no prompt)',
    untitled: 'Untitled',
    noSongsFound: 'No songs found',
    noSongsAvailable: 'No songs available',
    clickToAddSongs: 'Click + to add songs',
    uploaded: 'Uploaded',
    failed: 'Failed',
    songCount: (count: number) => (count === 1 ? 'song' : 'songs'),
  },

  errors: {
    couldNotGenerateLyrics: 'Could not generate lyrics',
    couldNotGenerateSong: 'Could not generate song',
    couldNotFetchHistory: 'Could not fetch history',
    couldNotCreateHistoryItem: 'Could not create history item',
    couldNotUpdateHistoryItem: 'Could not update history item',
    couldNotDeleteHistoryItem: 'Could not delete history item',
    couldNotFetchGenres: 'Could not fetch genres',
    couldNotAddGenre: 'Could not add genre',
    couldNotRemoveGenre: 'Could not remove genre',
    couldNotDownloadMixtape: 'Could not download mixtape',
    couldNotStartMixtapeGeneration: 'Could not start mixtape generation',
    couldNotUploadFiles: 'Could not upload files',
    couldNotFetchStatus: 'Could not fetch status',
    maxFilesPerUpload: 'Maximum 10 files per upload',
    allFilesMustHaveTitle: 'All files must have a title',
    sunoApiKeyMissing:
      'Suno API key missing. Add SUNO_API_KEY in backend .env and restart the server.',
    openaiApiKeyMissing:
      'OpenAI API key missing. Add OPENAI_API_KEY in backend .env and restart the server.',
  },

  filters: {
    songs: 'Songs',
    liked: 'Liked',
    all: 'All',
  },
} as const;

export type Translations = typeof en;
