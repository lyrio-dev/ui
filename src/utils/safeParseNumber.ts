export function parseNumber(object: unknown, allowFloat?: boolean): number;
export function parseNumber<T>(object: unknown, callback: (x: number) => T, allowEmpty?: boolean): void;
export function parseNumber<T>(object: unknown, allowFloat: boolean, callback: (x: number) => T, allowEmpty?: boolean): void;

export function parseNumber(object: unknown, arg1?: unknown, arg2?: unknown): unknown {
  const s = String(object);
  const x = Number(s);

  const allowFloat = typeof arg1 === "boolean" && arg1;
  const callback = typeof arg1 === "function" ? arg1 : typeof arg2 === "function" ? arg2 : null;
  const allowEmpty = callback && typeof arguments[arguments.length - 1] === "boolean" && arguments[arguments.length - 1];

  if (!s && callback && allowEmpty) return callback(null);

  if (!allowFloat && (!Number.isSafeInteger(x) || String(x) !== s)) return null;

  if (callback) return callback(x);
  return x;
}

export function safeParseNumber(object: unknown, allowFloat = false): [success: boolean, x: number] {
  const x = parseNumber(object, allowFloat);
  return [!Number.isNaN(x), x];
}
