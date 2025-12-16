// Global declarations for browser-only fields
// This ensures `window.dataLayer` is recognized by TypeScript in client code

export {};

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}


