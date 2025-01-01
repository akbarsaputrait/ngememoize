import { CacheEntry, DependencyArray, MemoizeKey } from '../types';

export function defaultEquals<T>(prev: T, next: T): boolean {
  return JSON.stringify(prev) === JSON.stringify(next);
}

export function createDependencyKey(dependencies: DependencyArray): string {
  return JSON.stringify(
    dependencies.map((dep) => {
      if (dep && typeof dep === 'object') {
        return Object.entries(dep)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${JSON.stringify(v)}`);
      }
      return dep;
    })
  );
}

export function isMemoizeKey(value: unknown): value is MemoizeKey {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol'
  );
}

export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

export function isCacheEntry<T>(value: unknown): value is CacheEntry<T> {
  if (!value || typeof value !== 'object') return false;

  const entry = value as CacheEntry<T>;
  return (
    'value' in entry &&
    'timestamp' in entry &&
    typeof entry.timestamp === 'number'
  );
}
