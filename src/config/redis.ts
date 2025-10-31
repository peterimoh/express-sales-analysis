import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let isConnected = false;

// Initialize Redis connection with error handling
async function initRedis(): Promise<void> {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️  REDIS_URL not set. Caching will be disabled.");
    return;
  }

  try {
    redisClient = createClient({ url: process.env.REDIS_URL });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
      isConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("🔄 Redis connecting...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis connected successfully");
      isConnected = true;
    });

    redisClient.on("end", () => {
      console.warn("⚠️  Redis connection closed");
      isConnected = false;
    });

    await redisClient.connect();
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    console.warn("⚠️  Continuing without Redis cache...");
    isConnected = false;
    redisClient = null;
  }
}

// Initialize connection (non-blocking)
initRedis().catch((error) => {
  console.error("Redis initialization error:", error);
});

export class RedisClient {
  async get(key: string): Promise<string | null> {
    if (!redisClient || !isConnected) {
      return null;
    }

    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set(
    key: string,
    value: string,
    options: { EX?: number } = {}
  ): Promise<void> {
    if (!redisClient || !isConnected) {
      return;
    }

    try {
      const expirationTime = options.EX ?? 1800; // Default to 30 minutes (1800 seconds)
      await redisClient.set(key, value, { EX: expirationTime });
    } catch (error) {
      console.error("Redis set error:", error);
      // Silently fail - caching is optional
    }
  }

  async disconnect(): Promise<void> {
    if (redisClient && isConnected) {
      try {
        await redisClient.quit();
        isConnected = false;
      } catch (error) {
        console.error("Redis disconnect error:", error);
      }
    }
  }
}

export default new RedisClient();
