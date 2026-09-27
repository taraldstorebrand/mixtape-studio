import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

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
