import { Injectable } from '@angular/core';
import { CacheMap, CacheStats } from './types';

@Injectable({
  providedIn: 'root',
})
export class NgememoizeService {
  constructor() {}

  hello() {
    return 'Hello from NgememoizeService';
  }

  private caches: Map<string, CacheMap<any>> = new Map();
  private stats: Map<string, { hits: number; misses: number }> = new Map();

  getCache<T>(identifier: string): CacheMap<T> {
    if (!this.caches.has(identifier)) {
      this.caches.set(identifier, new Map());
      this.stats.set(identifier, { hits: 0, misses: 0 });
    }
    return this.caches.get(identifier) as CacheMap<T>;
  }

  clearCache(identifier?: string): void {
    if (identifier) {
      this.caches.delete(identifier);
      this.stats.delete(identifier);
    } else {
      this.caches.clear();
      this.stats.clear();
    }
  }

  recordCacheHit(identifier: string): void {
    const stats = this.stats.get(identifier);
    if (stats) {
      stats.hits++;
    }
  }

  recordCacheMiss(identifier: string): void {
    const stats = this.stats.get(identifier);
    if (stats) {
      stats.misses++;
    }
  }

  getCacheStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};

    this.caches.forEach((cache, key) => {
      const entries = Array.from(cache.values());
      const cacheStats = this.stats.get(key) || { hits: 0, misses: 0 };
      const total = cacheStats.hits + cacheStats.misses;

      stats[key] = {
        size: cache.size,
        lastAccessed: Math.max(...entries.map((e) => e.timestamp)),
        hitRate: total ? cacheStats.hits / total : 0,
        missRate: total ? cacheStats.misses / total : 0,
      };
    });

    return stats;
  }

  getAllCache(): Record<string, CacheMap<any>> {
    const allCaches: Record<string, CacheMap<any>> = {};
    this.caches.forEach((cache, key) => {
      allCaches[key] = cache;
    });
    return allCaches;
  }
}
