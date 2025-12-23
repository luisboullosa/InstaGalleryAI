// In-memory server-side localStorage shim to prevent SSR crashes
// Temporary: replace with proper client-only guards in source later
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
  (function () {
    const store = new Map();
    globalThis.localStorage = {
      getItem(key) {
        return store.has(String(key)) ? store.get(String(key)) : null;
      },
      setItem(key, value) {
        store.set(String(key), String(value));
      },
      removeItem(key) {
        store.delete(String(key));
      },
      clear() {
        store.clear();
      }
    };
  })();
}
