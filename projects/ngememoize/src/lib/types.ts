export type MemoizeKey = string | number | symbol;

export interface DependencyArray extends Array<any> {}

export type KeyGeneratorFunction<
  TArgs extends any[],
  TKey extends MemoizeKey = string
> = (...args: TArgs) => TKey;

export type EqualityComparator<T> = (prev: T, next: T) => boolean;

export interface MemoizeOptions<TArgs extends any[] = any[], TResult = any> {
  maxAge?: number;
  maxSize?: number;
  keyGenerator?: KeyGeneratorFunction<TArgs>;
  equals?: EqualityComparator<TResult>;
  debugLabel?: string;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  dependencies?: DependencyArray;
}

export type CacheMap<T> = Map<MemoizeKey, CacheEntry<T>>;

export interface CacheStats {
  size: number;
  lastAccessed: number;
  hitRate: number;
  missRate: number;
}
