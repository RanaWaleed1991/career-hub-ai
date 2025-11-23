// Polyfill for Promise.withResolvers (Node.js < 22)
// This must be loaded before any code that uses it

if (typeof Promise.withResolvers === 'undefined') {
  console.log('⚙️  Applying Promise.withResolvers polyfill for Node.js < 22');
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
} else {
  console.log('✓ Promise.withResolvers already available (Node.js >= 22)');
}

export {};
