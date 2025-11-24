// Polyfill for Promise.withResolvers
// This is needed for browsers/environments that don't support this ES2024 feature
// Used by pdfjs-dist library for PDF text extraction

if (typeof Promise.withResolvers === 'undefined') {
  console.log('⚙️  Applying Promise.withResolvers polyfill');
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export {};
