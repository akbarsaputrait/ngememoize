import { NgememoizeService } from './ngememoize.service';
import { defaultEquals, isPromise, createDependencyKey } from './utils/general';
import { MemoizeOptions, DependencyArray, NgememoizeProps } from './types';
import {
  createOptimizedKeyGenerator,
  defaultKeyGenerator,
} from './utils/key-generator';

/**
 * Memoizes a function, caching its results based on the provided arguments.
 * @param context - The context in which the function is called.
 * @param fn - The function to be memoized.
 * @param cacheIdentifier - A unique identifier for the cache.
 * @param args - The arguments to be passed to the function.
 * @param options - Options for memoization, including cache settings and callbacks.
 * @param keyGenerator - A function to generate a unique key for the cache.
 * @param equals - A function to compare cached values for equality.
 * @param onCacheHit - Callback invoked when a cache hit occurs.
 * @param onCacheMiss - Callback invoked when a cache miss occurs.
 * @returns The result of the memoized function.
 */
function memoizeFunction<TArgs extends any[], TResult>({
  context,
  fn,
  cacheIdentifier,
  args,
  options,
  keyGenerator = defaultKeyGenerator,
  equals = defaultEquals,
  onCacheHit,
  onCacheMiss,
}: NgememoizeProps<TArgs, TResult>): TResult {
  // Get the service from context or create a new instance
  let memoizeService: NgememoizeService;
  if (context.memoizeService instanceof NgememoizeService) {
    memoizeService = context.memoizeService;
  } else {
    memoizeService = new NgememoizeService();
    context.memoizeService = memoizeService;
  }

  const cache = memoizeService.getCache<TResult>(cacheIdentifier);
  const key = createOptimizedKeyGenerator<TArgs>(...args);
  const generatedKey = keyGenerator(...args);
  const now = Date.now();
  const cached = cache.get(key);
  const cacheStatus = cached ? 'hit' : 'miss';

  if (options.debugLabel) {
    console.debug(
      `[Memoize: ${options.debugLabel}] Cache ${cacheStatus} for key: ${key}`
    );
  }

  if (cached) {
    if (options.maxAge && now - cached.timestamp > options.maxAge) {
      cache.delete(key);

      if (options.debugLabel) {
        console.debug(
          `[Memoize: ${options.debugLabel}] Delete Cache for key: ${key}`
        );
      }

      memoizeService.recordCacheMiss(cacheIdentifier);
      if (onCacheMiss) {
        onCacheMiss(generatedKey);
      }
    } else {
      memoizeService.recordCacheHit(cacheIdentifier);

      if (onCacheHit) {
        onCacheHit(generatedKey);
      }
      return cached.value;
    }
  }

  memoizeService.recordCacheMiss(cacheIdentifier);
  if (onCacheMiss) {
    onCacheMiss(generatedKey);
  }

  if (options.maxSize && cache.size >= options.maxSize) {
    const oldestKey = Array.from(cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    )[0][0];
    cache.delete(oldestKey);
  }

  const result = fn.apply(context, args);

  if (isPromise(result)) {
    return result.then(resolvedResult => {
      if (
        (Array.isArray(resolvedResult) && resolvedResult.length > 0) ||
        resolvedResult
      ) {
        cache.set(key, { value: result, timestamp: now, generatedKey });
      }
      return resolvedResult;
    }) as TResult;
  }

  if ((Array.isArray(result) && result.length > 0) || result) {
    cache.set(key, { value: result, timestamp: now, generatedKey });
  }

  if (onCacheMiss) {
    onCacheMiss(generatedKey);
  }

  return result;
}

/**
 * Decorator that memoizes the result of a method.
 * @param options - Options for memoization, including cache settings and callbacks.
 * @returns A method decorator.
 */
export function Ngememoize<TArgs extends any[] = any[], TResult = any>(
  options: MemoizeOptions<TArgs, TResult> = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<TResult>
  ) {
    if (!descriptor.value && !descriptor.get) {
      throw new Error(
        'Memoize decorator can only be applied to methods or getters'
      );
    }

    const cacheIdentifier = `${target.constructor.name}_${propertyKey}`;
    const keyGenerator = options.keyGenerator || defaultKeyGenerator;
    const equals = options.equals || defaultEquals;

    if (descriptor.value) {
      const originalMethod = descriptor.value as (...args: TArgs) => TResult; // Cast to the correct type
      descriptor.value = function (this: any, ...args: TArgs): TResult {
        const filteredArgs = args.filter(
          arg => arg !== null && arg !== undefined
        ) as TArgs;
        return memoizeFunction<TArgs, TResult>({
          context: this,
          fn: originalMethod,
          cacheIdentifier,
          args: filteredArgs,
          options,
          keyGenerator,
          equals,
          onCacheHit: options.onCacheHit,
          onCacheMiss: options.onCacheMiss,
        });
      } as any;
    } else if (descriptor.get) {
      const originalGetter = descriptor.get;
      descriptor.get = function (this: any): TResult {
        return memoizeFunction<[], TResult>({
          context: this,
          fn: originalGetter.bind(this),
          cacheIdentifier,
          args: [],
          options,
          keyGenerator,
          equals,
          onCacheHit: options.onCacheHit,
          onCacheMiss: options.onCacheMiss,
        });
      };
    }

    return descriptor;
  };
}

/**
 * Decorator that memoizes the result of a method with dependencies.
 * @param dependencies - A function that returns the dependencies for the memoization.
 * @param options - Options for memoization, including cache settings and callbacks.
 * @returns A method decorator.
 */
export function NgememoizeWithDeps<TArgs extends any[] = any[], TResult = any>(
  dependencies: () => DependencyArray,
  options: MemoizeOptions<[...TArgs, string] | [string], TResult> = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<TResult>
  ) {
    const cacheIdentifier = `${target.constructor.name}_${propertyKey}`;
    const keyGenerator = options.keyGenerator || defaultKeyGenerator;
    const equals = options.equals || defaultEquals;

    if (descriptor.value) {
      // Handle methods
      const originalMethod = descriptor.value as (...args: TArgs) => TResult;
      descriptor.value = function (this: any, ...args: TArgs): TResult {
        const deps = dependencies.call(this);
        const depsKey = createDependencyKey(deps);
        const filteredArgs = args.filter(
          arg => arg !== null && arg !== undefined
        ) as TArgs;

        return memoizeFunction<[...TArgs, string], TResult>({
          context: this,
          fn: (...allArgs: [...TArgs, string]) =>
            originalMethod.apply(this, allArgs.slice(0, -1) as TArgs),
          cacheIdentifier,
          args: [...filteredArgs, depsKey],
          options,
          keyGenerator,
          equals,
        });
      } as any;
    } else if (descriptor.get) {
      // Handle getters
      const originalGetter = descriptor.get;
      descriptor.get = function (this: any): TResult {
        const deps = dependencies.call(this);
        const depsKey = createDependencyKey(deps);

        return memoizeFunction<[string], TResult>({
          context: this,
          fn: () => originalGetter.call(this),
          cacheIdentifier,
          args: [depsKey],
          options,
          keyGenerator: depsKey => depsKey,
          equals,
        });
      };
    }

    return descriptor;
  };
}
