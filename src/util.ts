export function allObjectKeys(obj: any): PropertyKey[] {
  const names = Object.getOwnPropertyNames(obj) as PropertyKey[];
  const symbols = Object.getOwnPropertySymbols(obj) as PropertyKey[];

  return names.concat(symbols);
}

export function ensureArray<T>(value: T | null | undefined | T[]): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
