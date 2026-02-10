import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { broadcastSseEvent } from './sse';
import { getHistoryItemsByJobId, updateHistoryItem } from '../db';
import {
  SunoGenerateRequest,
  SunoApiEnvelope,
  SunoGenerateData,
  SunoRecordInfoData,
  SunoStatusResponse,
} from './suno.types';

export { SunoStatusResponse } from './suno.types';

const SUNO_API_BASE_URL = 'https://api.sunoapi.org';
const MP3_DIR = path.join(__dirname, '../../mp3s');
const IMAGES_DIR = path.join(__dirname, '../../images');
const PLACEHOLDER_IMAGE = path.join(__dirname, '../assets/placeholder.png');

// Suno API docs (Quick Start):
// - POST  /api/v1/generate
// - GET   /api/v1/generate/record-info?taskId=...
// Ref: https://docs.sunoapi.org/suno-api/quickstart

// Store active polling jobs
const activeJobs = new Map<string, NodeJS.Timeout>();

// Store job titles for filename generation
const jobTitles = new Map<string, string>();

// Sanitize title for filesystem
function sanitizeFilename(title: string): string {
  return title.replace(/[/\\?*<>|":]/g, '_');
}

// Find next available index for a title
function getNextIndex(sanitizedTitle: string): number {
  const files = fs.readdirSync(MP3_DIR);
  const pattern = new RegExp(`^${sanitizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_(\\d+)\\.mp3$`);
  let maxIndex = 0;
  for (const file of files) {
    const match = file.match(pattern);
    if (match) {
      maxIndex = Math.max(maxIndex, parseInt(match[1], 10));
    }
  }
  return maxIndex + 1;
}

// Ensure mp3s directory exists
if (!fs.existsSync(MP3_DIR)) {
  fs.mkdirSync(MP3_DIR, { recursive: true });
}

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Downloads a file from a URL and saves it locally.
 * @param url - The URL to download from
 * @param dir - The directory to save the file in
 * @param sanitizedTitle - The sanitized title for the filename
 * @param index - The index for the filename
 * @param extension - The file extension (e.g., 'mp3', 'png')
 * @param fallbackPath - Optional fallback file to copy if download fails
 * @returns The filename of the saved file
 */
async function downloadFile(
  url: string,
  dir: string,
  sanitizedTitle: string,
  index: number,
  extension: string,
  fallbackPath?: string
): Promise<string> {
  const filename = `${sanitizedTitle}_${index}.${extension}`;
  const filepath = path.join(dir, filename);

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filepath, response.data);
  } catch (err) {
    if (fallbackPath) {
      console.error(`Download failed, using fallback:`, err);
      fs.copyFileSync(fallbackPath, filepath);
    } else {
      throw err;
    }
  }

  return filename;
}

// Function to send SSE updates
function sendSunoUpdate(jobId: string, status: SunoStatusResponse) {
  broadcastSseEvent('suno-update', { jobId, ...status });
}

// Function to stop polling for a job
function stopPolling(jobId: string) {
  const timeout = activeJobs.get(jobId);
  if (timeout) {
    clearTimeout(timeout);
    activeJobs.delete(jobId);
  }
}

/**
 * Polls Suno API for job status and sends updates via WebSocket.
 * Downloads MP3s and images when the job completes successfully.
 * Automatically retries up to 120 times (10 minutes) with 5-second intervals.
 * @param jobId - The Suno task ID to poll
 * @param attempt - Current attempt number (used for retry limiting)
 */
async function pollAndUpdate(jobId: string, attempt: number = 0) {
  const maxAttempts = 120; // 10 minutes with 5 second intervals

  try {
    const status = await getSongStatus(jobId);
    
    // Download MP3s and images when completed
    if (status.status === 'completed' && status.audio_urls && status.audio_urls.length > 0) {
      const title = jobTitles.get(jobId) || jobId;
      const sanitizedTitle = sanitizeFilename(title);
      const startIndex = getNextIndex(sanitizedTitle);
      try {
        const localUrls = await Promise.all(
          status.audio_urls.map(async (url, i) => {
            const filename = await downloadFile(url, MP3_DIR, sanitizedTitle, startIndex + i, 'mp3');
            return `/mp3s/${filename}`;
          })
        );
        status.local_urls = localUrls;
        console.log('Downloaded MP3s, local URLs:', localUrls);

        // Download cover images if available
        if (status.image_urls && status.image_urls.length > 0) {
          const localImageUrls = await Promise.all(
            status.image_urls.map(async (url, i) => {
              const filename = await downloadFile(url, IMAGES_DIR, sanitizedTitle, startIndex + i, 'png', PLACEHOLDER_IMAGE);
              return `/images/${filename}`;
            })
          );
          status.image_urls = localImageUrls;
          console.log('Downloaded images, local URLs:', status.image_urls);
        }

        jobTitles.delete(jobId);

        // Persist completed songs to DB so they survive restarts
        try {
          const items = getHistoryItemsByJobId(jobId);
          for (const item of items) {
            const idx = item.variationIndex ?? 0;
            updateHistoryItem(item.id, {
              sunoStatus: 'completed',
              sunoAudioUrl: status.audio_urls![idx],
              sunoLocalUrl: localUrls[idx],
              sunoImageUrl: status.image_urls?.[idx],
              duration: status.durations?.[idx],
            });
          }
        } catch (dbError) {
          console.error('Error updating DB after download:', dbError);
        }
      } catch (downloadError) {
        console.error('Error downloading MP3s:', downloadError);
      }
    }
    
    // Send update via WebSocket
    sendSunoUpdate(jobId, status);
    
    // Continue polling if not completed or failed
    if (status.status !== 'completed' && status.status !== 'failed' && attempt < maxAttempts) {
      const timeout = setTimeout(() => pollAndUpdate(jobId, attempt + 1), 5000);
      activeJobs.set(jobId, timeout);
    } else {
      // Stop polling
      stopPolling(jobId);
    }
  } catch (error) {
    console.error('Error polling Suno status:', error);
    if (attempt < maxAttempts) {
      const timeout = setTimeout(() => pollAndUpdate(jobId, attempt + 1), 5000);
      activeJobs.set(jobId, timeout);
    } else {
      stopPolling(jobId);
      sendSunoUpdate(jobId, { status: 'failed', error: 'Failed to fetch status' });
    }
  }
}

/**
 * Initiates song generation via Suno API.
 * Uses custom mode when genre is provided, otherwise uses standard mode.
 * Starts background polling for status updates after initiating the request.
 * @param lyrics - The lyrics/prompt for the song (max 500 chars in non-custom mode)
 * @param genre - Optional genre/style for custom mode
 * @param title - Optional title for the song (defaults to 'Untitled')
 * @returns Object containing jobId and initial status
 * @throws Error if API key is missing or API request fails
 */
export async function generateSong(
  lyrics: string,
  genre?: string,
  title?: string
): Promise<{ jobId: string; status: string }> {
  try {
    const apiKey = process.env.SUNO_API_KEY;
    
    if (!apiKey) {
      throw new Error('SUNO_API_KEY is not configured');
    }

    // When genre is provided, use custom mode with style
    const useCustomMode = !!genre;
    
    // In non-custom mode, prompt is limited to 500 characters
    const prompt = useCustomMode ? lyrics : (lyrics.length > 500 ? lyrics.substring(0, 500) : lyrics);

    // We treat the provided "lyrics" as Suno's "prompt" (docs use prompt).
    // Keep our API stable to the frontend: return { jobId, status }.
    const requestData: SunoGenerateRequest = {
      prompt: prompt,
      customMode: useCustomMode,
      instrumental: false,
      model: 'V5',
      callBackUrl: 'https://example.com/callback',
      ...(useCustomMode && { style: genre, title: title || 'Untitled' }),
    };

    console.log('Suno API request:', JSON.stringify(requestData, null, 2));

    const response = await axios.post<SunoApiEnvelope<SunoGenerateData>>(
      `${SUNO_API_BASE_URL}/api/v1/generate`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Suno API response:', JSON.stringify(response.data, null, 2));

    if (response.data?.code !== 200 || !response.data?.data?.taskId) {
      console.error('Suno API error response:', response.data);
      throw new Error(response.data?.msg || 'Unexpected Suno response');
    }

    const jobId = response.data.data.taskId;
    
    // Store title for filename generation
    jobTitles.set(jobId, title || 'Untitled');
    
    // Start background polling and WebSocket updates
    setTimeout(() => pollAndUpdate(jobId), 5000);
    
    return { jobId, status: 'PENDING' };
  } catch (error: any) {
    console.error('Suno API error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.msg ||
      'Failed to generate song. Check API key and Suno API status.'
    );
  }
}

/**
 * Retrieves the current status of a song generation job from Suno API.
 * Maps Suno's internal status codes to frontend-friendly status strings.
 * @param jobId - The Suno task ID to check
 * @returns Status response with audio URLs, image URLs, and durations when available
 * @throws Error if API key is missing or API request fails
 */
export async function getSongStatus(jobId: string): Promise<SunoStatusResponse> {
  try {
    const apiKey = process.env.SUNO_API_KEY;
    
    if (!apiKey) {
      throw new Error('SUNO_API_KEY is not configured');
    }

    console.log('Checking Suno status for jobId:', jobId);

    const response = await axios.get<SunoApiEnvelope<SunoRecordInfoData>>(
      `${SUNO_API_BASE_URL}/api/v1/generate/record-info`,
      {
        params: { taskId: jobId },
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log('Suno status response:', JSON.stringify(response.data, null, 2));

    if (response.data?.code !== 200 || !response.data?.data) {
      console.error('Suno status API error response:', response.data);
      throw new Error(response.data?.msg || 'Unexpected Suno status response');
    }

    const data = response.data.data;
    // Based on API docs, the structure is data.response.sunoData[0].audioUrl
    const tracks = data.response?.sunoData || [];
    const audioUrls = tracks
      .map(track => track.sourceAudioUrl)
      .filter(url => url) as string[];
    const imageUrls = tracks
      .map(track => track.imageUrl)
      .filter(url => url) as string[];
    const durations = tracks
      .map(track => track.duration)
      .filter((d): d is number => d != null);

    // Map API status to our expected status values
    let mappedStatus = data.status;
    if (data.status === 'TEXT_SUCCESS') {
      mappedStatus = 'GENERATING';
    } else if (data.status === 'FIRST_SUCCESS') {
      mappedStatus = 'FIRST_SUCCESS'; // Keep as is for frontend to handle
    } else if (data.status === 'SUCCESS') {
      mappedStatus = 'SUCCESS';
    } else if (['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(data.status)) {
      mappedStatus = 'FAILED';
    }

    // For frontend compatibility, map to expected status strings
    // D-041: Removed 'partial' status - each song variation is now a separate history item
    let frontendStatus: string = 'pending';
    if (mappedStatus === 'SUCCESS') {
      frontendStatus = 'completed';
    } else if (mappedStatus === 'FAILED') {
      frontendStatus = 'failed';
    } else {
      frontendStatus = 'pending'; // PENDING, GENERATING, FIRST_SUCCESS, etc.
    }

    return {
      status: frontendStatus,
      audio_urls: audioUrls.length > 0 ? audioUrls : undefined,
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      durations: durations.length > 0 ? durations : undefined,
      error: data.status === 'FAILED' || data.errorCode ? (data.errorMessage || response.data.msg) : undefined,
    };
  } catch (error: any) {
    console.error('Suno API status error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.msg ||
      'Failed to fetch song generation status.'
    );
  }
}
