import { Connection, clusterApiUrl } from '@solana/web3.js';
import NodeCache from 'node-cache';

interface RPCConfig {
  url: string;
  weight: number;
  priority: number;
}

class SolanaConnectionManager {
  private connections: RPCConfig[] = [
    { url: process.env.HELIUS_RPC_URL || '', weight: 3, priority: 1 },
    { url: process.env.QUICKNODE_RPC_URL || '', weight: 2, priority: 2 },
    { url: clusterApiUrl('mainnet-beta'), weight: 1, priority: 3 },
  ];

  private activeConnection: Connection | null = null;
  private cache: NodeCache;
  private lastError: Error | null = null;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 30 }); // 30 seconds cache
    this.initializeConnection();
  }

  private async initializeConnection() {
    for (const config of this.connections.sort((a, b) => a.priority - b.priority)) {
      try {
        const connection = new Connection(config.url, 'confirmed');
        await connection.getVersion();
        this.activeConnection = connection;
        console.log(`Connected to Solana RPC: ${config.url}`);
        return;
      } catch (error) {
        console.error(`Failed to connect to ${config.url}:`, error);
        this.lastError = error as Error;
      }
    }
    throw new Error('Failed to connect to any Solana RPC endpoint');
  }

  public async getConnection(): Promise<Connection> {
    if (!this.activeConnection) {
      await this.initializeConnection();
    }
    return this.activeConnection!;
  }

  public async getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await fetchFn();
    this.cache.set(key, data);
    return data;
  }

  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw lastError;
  }
}

export const solanaManager = new SolanaConnectionManager(); 