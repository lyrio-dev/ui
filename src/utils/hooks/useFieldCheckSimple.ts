import { useRef, useState } from "react";

export function useFieldCheckSimple(
  fieldValue: string,
  check?: (fieldValue: string) => boolean
): [() => boolean, boolean] {
  const checkResultRef = useRef(true);
  const [checkResultState, setCheckResultState] = useState(true);

  const checkField = () => setCheckResultState((checkResultRef.current = check(fieldValue)));

  return [
    () => {
      checkField();
      return checkResultRef.current;
    },
    !checkResultState
  ];
}
