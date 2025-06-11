import Redis from 'ioredis';

export class QueueManager {
  constructor(private redis: Redis) {}

  async getNextJob(queueName: string, timeout: number): Promise<any | null> {
    const result = await this.redis.blpop(queueName, timeout);
    if (result && result.length >= 2) {
      return JSON.parse(result[1]);
    }
    return null;
  }

  async addJob(queueName: string, jobType: string, data: any): Promise<void> {
    const job = {
      id: crypto.randomUUID(),
      type: jobType,
      data,
      createdAt: new Date().toISOString(),
    };
    
    await this.redis.rpush(queueName, JSON.stringify(job));
  }
}