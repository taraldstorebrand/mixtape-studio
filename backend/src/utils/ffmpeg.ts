import { spawnSync, spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

/**
 * Get MP3 duration synchronously (for upload processing).
 * @returns Duration in seconds, or undefined if parsing fails
 */
export function getMp3DurationSync(filePath: string): number | undefined {
  const result = spawnSync(ffmpegPath!, ['-i', filePath, '-f', 'null', '-'], {
    encoding: 'utf-8',
    timeout: 30000,
  });

  const output = result.stderr || result.stdout || '';
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const centiseconds = parseInt(match[4], 10);
    return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
  }

  if (result.error) {
    console.error('Could not determine MP3 duration:', result.error.message);
  }
  return undefined;
}

/**
 * Get audio duration asynchronously (for mixtape generation).
 * @returns Duration in milliseconds
 */
export async function getAudioDurationMs(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    const ffmpeg = spawn(ffmpegPath!, ['-i', filePath, '-hide_banner']);
    let output = '';

    ffmpeg.stderr?.on('data', (data: Buffer) => {
      output += data.toString();
    });

    ffmpeg.on('close', () => {
      const match = output.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        const centiseconds = parseInt(match[4], 10);
        resolve((hours * 3600 + minutes * 60 + seconds) * 1000 + centiseconds * 10);
      } else {
        resolve(0);
      }
    });

    ffmpeg.on('error', () => {
      resolve(0);
    });
  });
}
