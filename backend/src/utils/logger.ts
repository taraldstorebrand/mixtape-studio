const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[${formatTimestamp()}] INFO: ${message}`, data ?? '');
  },
  error: (message: string, error?: any) => {
    console.error(`[${formatTimestamp()}] ERROR: ${message}`, error ?? '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[${formatTimestamp()}] WARN: ${message}`, data ?? '');
  },
};
