import { Injectable } from '@angular/core';
import { CacheMap, CacheStats } from './types';

/**
 * Service for managing memoization caches.
 */
@Injectable({
  providedIn: 'root',
})
export class NgememoizeService {
  private caches: Map<string, CacheMap<any>> = new Map();
  private stats: Map<string, { hits: number; misses: number }> = new Map();

  /**
   * Retrieves the cache associated with the given identifier.
   * @param identifier - The unique identifier for the cache.
   * @returns The cache map associated with the identifier.
   */
  getCache<T>(identifier: string): CacheMap<T> {
    if (!this.caches.has(identifier)) {
      this.caches.set(identifier, new Map());
      this.stats.set(identifier, { hits: 0, misses: 0 });
    }
    return this.caches.get(identifier) as CacheMap<T>;
  }

  /**
   * Clears the cache for the given identifier or all caches if no identifier is provided.
   * @param identifier - The unique identifier for the cache to clear.
   */
  clearCache(identifier?: string): void {
    if (identifier) {
      this.caches.delete(identifier);
      this.stats.delete(identifier);
    } else {
      this.caches.clear();
      this.stats.clear();
    }
  }

  /**
   * Records a cache hit for the given identifier.
   * @param identifier - The unique identifier for the cache.
   */
  recordCacheHit(identifier: string): void {
    const stats = this.stats.get(identifier);
    if (stats) {
      stats.hits++;
    }
  }

  /**
   * Records a cache miss for the given identifier.
   * @param identifier - The unique identifier for the cache.
   */
  recordCacheMiss(identifier: string): void {
    const stats = this.stats.get(identifier);
    if (stats) {
      stats.misses++;
    }
  }

  /**
   * Retrieves statistics about all caches.
   * @returns An object containing cache statistics.
   */
  getCacheStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};

    this.caches.forEach((cache, key) => {
      const entries = Array.from(cache.values());
      const cacheStats = this.stats.get(key) || { hits: 0, misses: 0 };
      const total = cacheStats.hits + cacheStats.misses;

      stats[key] = {
        size: cache.size,
        lastAccessed: Math.max(...entries.map(e => e.timestamp)),
        hitRate: total ? cacheStats.hits / total : 0,
        missRate: total ? cacheStats.misses / total : 0,
      };
    });

    return stats;
  }

  /**
   * Retrieves all caches.
   * @returns An object containing all cache maps.
   */
  getAllCache(): Record<string, CacheMap<any>> {
    const allCaches: Record<string, CacheMap<any>> = {};
    this.caches.forEach((cache, key) => {
      allCaches[key] = cache;
    });
    return allCaches;
  }
}
