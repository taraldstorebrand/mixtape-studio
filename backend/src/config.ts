import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  sunoApiKey: process.env.SUNO_API_KEY || '',
};

if (!config.openaiApiKey) {
  console.warn('Warning: OPENAI_API_KEY is not set');
}

if (!config.sunoApiKey) {
  console.warn('Warning: SUNO_API_KEY is not set');
}
