import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import chatgptRoutes from './routes/chatgpt';
import sunoRoutes from './routes/suno';
import historyRoutes from './routes/history';
import genresRoutes from './routes/genres';
import mixtapeRoutes from './routes/mixtape';
import { errorHandler } from './middleware/errorHandler';
import './db';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Static file serving for downloaded MP3s
app.use('/mp3s', express.static(path.join(__dirname, '../mp3s')));

// Routes
app.use('/api/chatgpt', chatgptRoutes);
app.use('/api/suno', sunoRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/mixtape', mixtapeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handler (must be after routes)
app.use(errorHandler);

// Export io for use in other modules
export { io };

// Start server
server.listen(config.port, () => {
  console.log(`Server kjører på port ${config.port}`);
  console.log(`CORS origin: ${config.corsOrigin}`);
});
