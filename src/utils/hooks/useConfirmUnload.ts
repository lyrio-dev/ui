import { useEffect } from "react";

export function useConfirmUnload(getIfConfirm: () => boolean) {
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (getIfConfirm()) e.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  });
}
