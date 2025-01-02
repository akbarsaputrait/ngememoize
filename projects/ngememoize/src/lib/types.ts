/**
 * Represents a key that can be used for memoization.
 * It can be a string, number, or symbol.
 */
export type MemoizeKey = string | number | symbol;

/**
 * Represents an array of dependencies for memoization.
 */
export interface DependencyArray extends Array<any> {}

/**
 * A function type that generates a key based on the provided arguments.
 *
 * @param args - The arguments to generate the key from.
 * @returns The generated key of type TKey.
 */
export type KeyGeneratorFunction<
  TArgs extends any[],
  TKey extends MemoizeKey = string,
> = (...args: TArgs) => TKey;

/**
 * A comparator function to compare two values for equality.
 *
 * @param prev - The previous value.
 * @param next - The next value.
 * @returns True if the values are equal, false otherwise.
 */
export type EqualityComparator<T> = (prev: T, next: T) => boolean;

/**
 * Options for the memoization behavior.
 */
export interface MemoizeOptions<TArgs extends any[] = any[], TResult = any> {
  /** The maximum age of the cache entry in milliseconds. */
  maxAge?: number;
  /** The maximum size of the cache. */
  maxSize?: number;
  /** A function to generate keys for caching. */
  keyGenerator?: KeyGeneratorFunction<TArgs>;
  /** A function to compare results for equality. */
  equals?: EqualityComparator<TResult>;
  /** A label for debugging purposes. */
  debugLabel?: string;
  /** Callback function when a cache miss occurs. */
  onCacheMiss?: (key: MemoizeKey) => void;
  /** Callback function when a cache hit occurs. */
  onCacheHit?: (key: MemoizeKey) => void;
}

/**
 * Represents a cache entry containing a value and its metadata.
 */
export interface CacheEntry<T> {
  /** The cached value. */
  value: T;
  /** The timestamp when the entry was created. */
  timestamp: number;
  /** An optional generated key for the cache entry. */
  generatedKey?: string;
  /** An optional array of dependencies associated with the cache entry. */
  dependencies?: DependencyArray;
}

/**
 * A map structure for storing cached entries.
 */
export type CacheMap<T> = Map<MemoizeKey, CacheEntry<T>>;

/**
 * Statistics about the cache, including size and access rates.
 */
export interface CacheStats {
  /** The current size of the cache. */
  size: number;
  /** The timestamp of the last access. */
  lastAccessed: number;
  /** The hit rate of the cache. */
  hitRate: number;
  /** The miss rate of the cache. */
  missRate: number;
}

/**
 * Properties required for the Ngememoize decorator.
 */
export type NgememoizeProps<TArgs extends any[], TResult> = {
  /** The context in which the memoized function is executed. */
  context: any;
  /** The original function to be memoized. */
  fn: (...args: TArgs) => TResult;
  /** A unique identifier for the cache. */
  cacheIdentifier: string;
  /** The arguments passed to the memoized function. */
  args: TArgs;
  /** Options for the memoization behavior. */
  options: MemoizeOptions<TArgs, TResult>;
  /** A function to generate keys for caching. */
  keyGenerator?: KeyGeneratorFunction<TArgs>;
  /** A function to compare results for equality. */
  equals?: EqualityComparator<TResult>;
  /** Callback function when a cache miss occurs. */
  onCacheMiss?: (key: MemoizeKey) => void;
  /** Callback function when a cache hit occurs. */
  onCacheHit?: (key: MemoizeKey) => void;
};
