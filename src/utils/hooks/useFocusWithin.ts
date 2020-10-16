import { useEffect, useState } from "react";

export function useFocusWithin(): [boolean, (element: HTMLElement) => void] {
  const [element, setElement] = useState<HTMLElement>();
  const [focuseWithin, setFocuseWithin] = useState(false);
  useEffect(() => {
    if (element) {
      const onFocus = () => setFocuseWithin(true);
      const onBlur = () => setFocuseWithin(false);
      element.addEventListener("focus", onFocus);
      element.addEventListener("blur", onBlur);

      return () => {
        element.removeEventListener("focus", onFocus);
        element.removeEventListener("blur", onBlur);
      };
    }
  }, [element]);

  return [focuseWithin, setElement];
}
