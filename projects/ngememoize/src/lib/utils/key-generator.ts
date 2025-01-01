import hash from 'object-hash';

// Hashing key for cache keys only
export const createOptimizedKeyGenerator = <TArgs extends any[]>(
  ...args: TArgs
): string => {
  return hash(args, {
    algorithm: 'sha1',
    encoding: 'base64',
    respectType: false,
    respectFunctionProperties: false,
    respectFunctionNames: false,
    unorderedArrays: false,
    unorderedObjects: true,
  });
};

export function defaultKeyGenerator<TArgs extends any[]>(
  ...args: TArgs
): string {
  return JSON.stringify(args).trim().replace(/ /g, '');
}
