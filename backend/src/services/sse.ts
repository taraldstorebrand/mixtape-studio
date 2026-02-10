import { Request, Response } from 'express';
import { EventEmitter } from 'events';

interface SseClient {
  id: string;
  response: Response;
}

class SseManager extends EventEmitter {
  private clients: Map<string, Response> = new Map();
  private clientIdCounter = 0;

  addClient(id: string, response: Response): void {
    this.clients.set(id, response);

    response.on('close', () => {
      this.removeClient(id);
    });

    response.on('error', () => {
      this.removeClient(id);
    });
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  broadcastSseEvent(eventType: string, data: any): void {
    const eventData = JSON.stringify(data);
    const deadClients: string[] = [];

    for (const [id, response] of this.clients) {
      try {
        response.write(`event: ${eventType}\n`);
        response.write(`data: ${eventData}\n\n`);
      } catch (error) {
        console.error(`Error sending SSE event to client ${id}:`, error);
        deadClients.push(id);
      }
    }

    for (const id of deadClients) {
      this.removeClient(id);
    }
  }

  cleanup(): void {
    for (const [id, response] of this.clients) {
      try {
        response.end();
      } catch (error) {
        console.error(`Error closing SSE connection for client ${id}:`, error);
      }
    }
    this.clients.clear();
  }

  getClientId(): string {
    return `sse_${++this.clientIdCounter}_${Date.now()}`;
  }
}

export const sseManager = new SseManager();

export function handleSseConnection(req: Request, res: Response): void {
  const clientId = sseManager.getClientId();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  sseManager.addClient(clientId, res);

  const keepaliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (error) {
      clearInterval(keepaliveInterval);
      sseManager.removeClient(clientId);
    }
  }, 30000);

  res.on('close', () => {
    clearInterval(keepaliveInterval);
  });

  res.on('error', () => {
    clearInterval(keepaliveInterval);
  });

  console.log(`SSE client connected: ${clientId}`);
}

export function broadcastSseEvent(eventType: string, data: any): void {
  sseManager.broadcastSseEvent(eventType, data);
}
