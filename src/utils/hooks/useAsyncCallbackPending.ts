import { useState } from "react";

export function useAsyncCallbackPending<T extends (...args: unknown[]) => Promise<unknown>>(
  callback: T,
  returnValueWhenPending?: ReturnType<T>
): [boolean, T] {
  const [pending, setPending] = useState(false);

  return [
    pending,
    (async (...args: Parameters<T>) => {
      if (pending) return returnValueWhenPending;
      setPending(true);
      try {
        return await callback(...args);
      } finally {
        setPending(false);
      }
    }) as T
  ];
}
