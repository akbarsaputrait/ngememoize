import { NgememoizeService } from './ngememoize.service';
import {
  defaultKeyGenerator,
  defaultEquals,
  isPromise,
  createDependencyKey,
} from './ngememoize.util';
import {
  MemoizeOptions,
  KeyGeneratorFunction,
  EqualityComparator,
  DependencyArray,
} from './types';

export type NgememoizeProps<TArgs extends any[], TResult> = {
  context: any;
  fn: (...args: TArgs) => TResult;
  cacheIdentifier: string;
  args: TArgs;
  options: MemoizeOptions<TArgs, TResult>;
  keyGenerator?: KeyGeneratorFunction<TArgs>;
  equals?: EqualityComparator<TResult>;
};

function memoizeFunction<TArgs extends any[], TResult>({
  context,
  fn,
  cacheIdentifier,
  args,
  options,
  keyGenerator = defaultKeyGenerator,
  equals = defaultEquals,
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
  const key = keyGenerator(...args);
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
      memoizeService.recordCacheMiss(cacheIdentifier);
    } else {
      memoizeService.recordCacheHit(cacheIdentifier);
      return cached.value;
    }
  }

  memoizeService.recordCacheMiss(cacheIdentifier);

  if (options.maxSize && cache.size >= options.maxSize) {
    const oldestKey = Array.from(cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    )[0][0];
    cache.delete(oldestKey);
  }

  const result = fn.apply(context, args);

  if (isPromise(result)) {
    return result.then((resolvedResult) => {
      if (
        (Array.isArray(resolvedResult) && resolvedResult.length > 0) ||
        resolvedResult
      ) {
        cache.set(key, { value: result, timestamp: now });
      }
      return resolvedResult;
    }) as TResult;
  }

  if ((Array.isArray(result) && result.length > 0) || result) {
    cache.set(key, { value: result, timestamp: now });
  }

  return result;
}

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
          (arg) => arg !== null && arg !== undefined
        ) as TArgs;
        return memoizeFunction<TArgs, TResult>({
          context: this,
          fn: originalMethod,
          cacheIdentifier,
          args: filteredArgs,
          options,
          keyGenerator,
          equals,
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
        });
      };
    }

    return descriptor;
  };
}

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
          (arg) => arg !== null && arg !== undefined
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
          keyGenerator: (depsKey) => depsKey,
          equals,
        });
      };
    }

    return descriptor;
  };
}
