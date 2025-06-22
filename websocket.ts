import { WebSocketServer } from 'ws';
import { poolService } from './services/poolService';
import { tokenService } from './services/tokenService';

interface Client {
  ws: WebSocket;
  subscriptions: Set<string>;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws) => {
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, { ws, subscriptions: new Set() });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'subscribe') {
            this.handleSubscription(clientId, data.channels);
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });

    // Start update interval
    this.startUpdateInterval();
  }

  private handleSubscription(clientId: string, channels: string[]) {
    const client = this.clients.get(clientId);
    if (client) {
      channels.forEach(channel => client.subscriptions.add(channel));
    }
  }

  private async startUpdateInterval() {
    this.updateInterval = setInterval(async () => {
      try {
        const poolMetrics = await poolService.getAllPoolMetrics();
        const tokenMetrics = await tokenService.getTokenMetrics();

        this.broadcast('pools', poolMetrics);
        this.broadcast('token', tokenMetrics);
      } catch (error) {
        console.error('Error in update interval:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  private broadcast(channel: string, data: any) {
    const message = JSON.stringify({ channel, data });
    
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.wss.close();
  }
}

export const wsManager = new WebSocketManager(); 