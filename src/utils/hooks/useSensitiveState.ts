import { Dispatch, SetStateAction, useCallback, useState } from "react";

export function useSensitiveState<S>(setModified: (modified: boolean) => void, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const [state, originalSetState] = useState(initialState);
  const setState = useCallback<Dispatch<SetStateAction<S>>>(action => {
    setModified(true);
    return originalSetState(action);
  }, [setModified]);
  return [state, setState];
}
