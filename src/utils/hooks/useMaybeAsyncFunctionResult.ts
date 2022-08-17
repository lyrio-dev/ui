import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

type RemoveLast<T extends any[]> = T extends [...infer RemovedLast, any] ? RemovedLast : any[];
type Last<T extends any[]> = T extends [...any, infer Last] ? Last : any[];

export const useMaybeAsyncFunctionResult = <F extends (...args: [...any, (result: any) => void]) => void>(
  f: F,
  args: RemoveLast<Parameters<F>>,
  dependencies?: any[]
) => {
  type Result = Parameters<Last<Parameters<F>>>[0];

  const refCurrentRenderingProcessId = useRef(null);

  function invoke(onResult: (result: Result) => void, onPending: () => void) {
    const renderingProcessId = uuid();
    refCurrentRenderingProcessId.current = renderingProcessId;

    let finished = false;
    f(...args, (result: any) => {
      finished = true;
      if (refCurrentRenderingProcessId.current === renderingProcessId) {
        onResult(result);
      }
    });

    if (!finished) {
      // async
      onPending();
    }
  }

  // Advance first invoke to first render, not first effect run
  const refFirstInvokeResult = useRef<Result>(null);
  const refFirstInvokePending = useRef<boolean>(false);
  if (refCurrentRenderingProcessId.current == null) {
    invoke(
      r => {
        if (refFirstInvokePending.current) {
          // First invoke async
          setResult(r);
          setPending(false);
        } else {
          // First invoke sync
          refFirstInvokeResult.current = r;
        }
      },
      () => (refFirstInvokePending.current = true)
    );
  }
  const [result, setResult] = useState(refFirstInvokeResult.current);
  const [pending, setPending] = useState(refFirstInvokePending.current);

  // Invocations due to dependencies change
  const refEffectFirstRun = useRef(false);
  useEffect(() => {
    if (!refEffectFirstRun.current) {
      refEffectFirstRun.current = true;
      return;
    }

    invoke(
      r => {
        setResult(r);
        setPending(false);
      },
      () => setPending(true)
    );
  }, dependencies || args);

  return [result, pending] as const;
};
