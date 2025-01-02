import hash from 'hash-it';

/**
 * Creates a hashed key for cache keys based on the provided arguments.
 * @param args - The arguments to generate the key from.
 * @returns A hashed string representation of the arguments.
 */
export const createOptimizedKeyGenerator = <TArgs extends any[]>(
  ...args: TArgs
): string => {
  return hash(args).toString();
};

/**
 * Generates a default key for caching based on the provided arguments.
 * @param args - The arguments to generate the key from.
 * @returns A string representation of the arguments.
 */
export function defaultKeyGenerator<TArgs extends any[]>(
  ...args: TArgs
): string {
  return JSON.stringify(args).trim().replace(/ /g, '');
}
