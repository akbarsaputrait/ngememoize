import { CacheEntry, DependencyArray, MemoizeKey } from '../types';

/**
 * Compares two values for equality using JSON serialization.
 * @param prev - The previous value.
 * @param next - The next value.
 * @returns True if the values are equal, false otherwise.
 */
export function defaultEquals<T>(prev: T, next: T): boolean {
  return JSON.stringify(prev) === JSON.stringify(next);
}

/**
 * Creates a unique key for the given dependencies.
 * @param dependencies - The dependencies to create a key from.
 * @returns A string representation of the dependencies.
 */
export function createDependencyKey(dependencies: DependencyArray): string {
  return JSON.stringify(
    dependencies.map(dep => {
      if (dep && typeof dep === 'object') {
        return Object.entries(dep)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${JSON.stringify(v)}`);
      }
      return dep;
    })
  );
}

/**
 * Checks if a value is a valid memoization key.
 * @param value - The value to check.
 * @returns True if the value is a valid memoization key, false otherwise.
 */
export function isMemoizeKey(value: unknown): value is MemoizeKey {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol'
  );
}

/**
 * Checks if a value is a Promise.
 * @param value - The value to check.
 * @returns True if the value is a Promise, false otherwise.
 */
export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

/**
 * Checks if a value is a valid cache entry.
 * @param value - The value to check.
 * @returns True if the value is a valid cache entry, false otherwise.
 */
export function isCacheEntry<T>(value: unknown): value is CacheEntry<T> {
  if (!value || typeof value !== 'object') return false;

  const entry = value as CacheEntry<T>;
  return (
    'value' in entry &&
    'timestamp' in entry &&
    typeof entry.timestamp === 'number'
  );
}
