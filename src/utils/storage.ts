export function readStorage(key: string): string | null {
  return window.localStorage.getItem(key);
}

export function writeStorage(key: string, value: string): void {
  window.localStorage.setItem(key, value);
}

export function removeStorage(key: string): void {
  window.localStorage.removeItem(key);
}
