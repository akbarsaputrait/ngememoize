# Ngememoize: Angular Memoization Library

\
Easily boost the performance of your Angular applications by memoizing functions and getters with this lightweight and simple-to-use library.

## ✨ Features

- **Memoize Functions**: Cache function results for improved performance.
- **Memoize Getters**: Optimize computed properties with caching.
- **Lightweight**: Designed for efficiency without adding unnecessary overhead.
- **Decorator Support**: Memoization is as simple as adding a decorator.
- **Angular Compatible**: Fully supports Angular 18 and later.
- **Tree Shakable**: Only include what you need.

---

## 📦 Installation

To get started, install Ngememoize via npm:

```bash
npm install ngememoize
```

Or, if you use Yarn or PNPM:

```bash
yarn add ngememoize
# or
pnpm add ngememoize
```

---

## 🚀 Quick Start


### Memoize a Function

```typescript
import { Ngememoize } from 'ngememoize';

  // Method example
  @Memoize<[number], number>({
    debugLabel: 'processData'
  })
  processData(value: number): number {
    console.log('Processing...');
    return value * 2;
  }

  // Getter example
  @Memoize<never, number>({
    debugLabel: 'computedValue'
  })
  get computedValue(): number {
    console.log('Computing...');
    return this.data.reduce((sum, val) => sum + val, 0);
  }

  // Dependent getter example
  @MemoizeWithDeps<never, number>(
    function(this: ExampleComponent) {
      return [this.data, this.multiplier];
    },
    { debugLabel: 'dependentValue' }
  )
  get dependentValue(): number {
    console.log('Computing dependent...');
    return this.computedValue * this.multiplier;
  }

  // Async method example
  @Memoize<[string], Promise<string>>({
    debugLabel: 'fetchData',
    maxAge: 5000
  })
  async fetchData(id: string): Promise<string> {
    console.log('Fetching...');
    return new Promise(resolve => 
      setTimeout(() => resolve(`Data for ${id}`), 1000)
    );
  }
```

---

## 🧪 Testing

To ensure everything works perfectly, tests are included. Run the following commands:

```bash
npm test
```

---

## 📚 Documentation

### Memoization Decorator

- **@memoize**: Use this decorator on functions or getters to enable memoization.

### Cache Behavior

- Cached results are invalidated when parameters or getter states change.

---

## 🎯 Benefits

- **Performance Boost**: Reduce redundant computations.
- **Cleaner Code**: Simplify logic by reducing manual caching.
- **Angular Ready**: Seamlessly integrates with your Angular projects.

---

## 🔧 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m 'Add awesome feature'`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 🤩 Credits

Ngememoize was built with ❤️ by developers who love Angular and believe in the power of simplicity and efficiency.

---

## 🌟 Support

If you find this library helpful, consider giving it a ⭐ on [GitHub](https://github.com/akbarsaputrait/ngememoize). Your support means a lot!

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/akbarsaputrait)


---

Now go forth and **memoize** your way to blazing-fast Angular apps! 🚀

