import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { config } from './config';
import chatgptRoutes from './routes/chatgpt';
import sunoRoutes from './routes/suno';
import historyRoutes from './routes/history';
import genresRoutes from './routes/genres';
import mixtapeRoutes, { cleanupOldTempFiles } from './routes/mixtape';
import uploadRoutes from './routes/upload';
import configStatusRoutes from './routes/configStatus';
import playlistsRoutes from './routes/playlists';
import { errorHandler } from './middleware/errorHandler';
import { handleSseConnection } from './services/sse';
import './db';

const crashLogPath = path.join(__dirname, '../data/crash.log');

function logCrash(type: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error
    ? `${error.message}\n${error.stack}`
    : String(error);
  const entry = `[${timestamp}] ${type}: ${message}\n\n`;
  try {
    fs.appendFileSync(crashLogPath, entry);
  } catch {
    // If we can't write the log, at least print to stderr
  }
  console.error(`[${timestamp}] ${type}:`, error);
}

process.on('uncaughtException', (error) => {
  logCrash('uncaughtException', error);
});

process.on('unhandledRejection', (reason) => {
  logCrash('unhandledRejection', reason);
});

cleanupOldTempFiles();
setInterval(cleanupOldTempFiles, 5 * 60 * 1000);

const app = express();
const server = createServer(app);
server.setTimeout(300000);

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Static file serving for downloaded MP3s
app.use('/mp3s', express.static(path.join(__dirname, '../mp3s')));

// Static file serving for downloaded cover images
app.use('/images', express.static(path.join(__dirname, '../images')));

// Static file serving for assets (placeholder images etc.)
app.use('/assets', express.static(path.join(__dirname, './assets')));

// Routes
app.use('/api/chatgpt', chatgptRoutes);
app.use('/api/suno', sunoRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/mixtape', mixtapeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/config-status', configStatusRoutes);
app.use('/api/playlists', playlistsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SSE endpoint for real-time updates
app.get('/api/events', handleSseConnection);

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`CORS origin: ${config.corsOrigin}`);
});
