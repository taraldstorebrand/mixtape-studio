import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { io } from '../server';

const SUNO_API_BASE_URL = 'https://api.sunoapi.org';
const MP3_DIR = path.join(__dirname, '../../mp3s');
const IMAGES_DIR = path.join(__dirname, '../../images');

// Suno API docs (Quick Start):
// - POST  /api/v1/generate
// - GET   /api/v1/generate/record-info?taskId=...
// Ref: https://docs.sunoapi.org/suno-api/quickstart

type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';

interface SunoGenerateRequest {
  prompt: string;
  customMode: boolean;
  instrumental: boolean;
  model: SunoModel;
  callBackUrl: string;
  // Required when customMode=true:
  style?: string;
  title?: string;
}

interface SunoApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}

interface SunoGenerateData {
  taskId: string;
}

type SunoTaskStatus = 'PENDING' | 'GENERATING' | 'TEXT_SUCCESS' | 'FIRST_SUCCESS' | 'SUCCESS' | 'FAILED' | 'CREATE_TASK_FAILED' | 'GENERATE_AUDIO_FAILED' | 'CALLBACK_EXCEPTION' | 'SENSITIVE_WORD_ERROR';

interface SunoRecordInfoTrack {
  id: string;
  audioUrl?: string;
  sourceAudioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  prompt?: string;
  modelName?: string;
  title?: string;
  tags?: string;
  createTime?: string;
  duration?: number;
}

interface SunoRecordInfoData {
  taskId: string;
  status: SunoTaskStatus;
  response?: {
    sunoData?: SunoRecordInfoTrack[];
  };
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface SunoStatusResponse {
  status: string;
  audio_urls?: string[];
  local_urls?: string[];
  image_urls?: string[];
  durations?: number[];
  error?: string;
}

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

// Download audio file and save locally
async function downloadMp3(url: string, sanitizedTitle: string, index: number): Promise<string> {
  const filename = `${sanitizedTitle}_${index}.mp3`;
  const filepath = path.join(MP3_DIR, filename);
  
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filepath, response.data);
  
  return filename;
}

// Download image file and save locally
async function downloadImage(url: string, sanitizedTitle: string, index: number): Promise<string> {
  const filename = `${sanitizedTitle}_${index}.jpg`;
  const filepath = path.join(IMAGES_DIR, filename);
  
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filepath, response.data);
  
  return filename;
}

// Function to send WebSocket updates
function sendSunoUpdate(jobId: string, status: SunoStatusResponse) {
  io.emit('suno-update', { jobId, ...status });
}

// Function to stop polling for a job
function stopPolling(jobId: string) {
  const timeout = activeJobs.get(jobId);
  if (timeout) {
    clearTimeout(timeout);
    activeJobs.delete(jobId);
  }
}

// Function to poll Suno status and send WebSocket updates
async function pollAndUpdate(jobId: string, attempt: number = 0) {
  const maxAttempts = 60; // 5 minutes with 5 second intervals

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
            const filename = await downloadMp3(url, sanitizedTitle, startIndex + i);
            return `/mp3s/${filename}`;
          })
        );
        status.local_urls = localUrls;
        console.log('Downloaded MP3s, local URLs:', localUrls);

        // Download cover images if available
        if (status.image_urls && status.image_urls.length > 0) {
          const localImageUrls = await Promise.all(
            status.image_urls.map(async (url, i) => {
              try {
                const filename = await downloadImage(url, sanitizedTitle, startIndex + i);
                return `/images/${filename}`;
              } catch (imgErr) {
                console.error('Error downloading image:', imgErr);
                return null;
              }
            })
          );
          status.image_urls = localImageUrls.filter((url): url is string => url !== null);
          console.log('Downloaded images, local URLs:', status.image_urls);
        }

        jobTitles.delete(jobId);
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
      sendSunoUpdate(jobId, { status: 'failed', error: 'Kunne ikke hente status' });
    }
  }
}

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
      'Kunne ikke generere sang. Sjekk API-nøkkel og Suno API status.'
    );
  }
}

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
      'Kunne ikke hente status for sang-generering.'
    );
  }
}
