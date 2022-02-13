import React, { useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useFieldCheck(
  fieldValue: string,
  alwaysCheck: boolean,
  debounce: number | false,
  syncCheck?: (fieldValue: string) => boolean | string,
  asyncCheck?: (fieldValue: string) => Promise<boolean | string>
): [
  (forceCheck?: boolean) => Promise<void>,
  (forceRecheck?: boolean) => Promise<boolean>,
  () => "" | "error" | "success" | "warning" | "validating",
  () => React.ReactNode,
  () => string
] {
  const [fieldChecking, setFieldChecking] = useState(false);
  const [fieldCheckStatus, setFieldCheckStatus] = useState<string | boolean>(false);
  const [fieldValueLastChecked, setFieldValueLastChecked] = useState(null);

  const fieldValueRef = useRef<string>();
  fieldValueRef.current = fieldValue;

  const fieldCheckStatusRef = useRef<boolean | string>();
  fieldCheckStatusRef.current = fieldCheckStatus;

  let onDoneRef = useRef<() => void>(null);

  async function checkField(forceCheck?: boolean) {
    // Do NOT check if the value is not changed
    if (fieldChecking || (fieldValueLastChecked === fieldValue && !alwaysCheck && !forceCheck)) return;

    // Do NOT check if is already checking
    setFieldChecking(true);

    async function check(value: string): Promise<string | boolean> {
      const syncCheckResult = !syncCheck || syncCheck(value);
      if (syncCheckResult !== true) return syncCheckResult;

      setFieldCheckStatus(false); // Remove error message
      const asyncCheckResult = !asyncCheck || (await asyncCheck(value));
      if (asyncCheckResult !== true) return asyncCheckResult;

      return true;
    }

    // Check again if value modified while checking
    while (1) {
      const checkedValue = fieldValueRef.current;
      const status = await check(checkedValue);
      if (fieldValueRef.current === checkedValue) {
        setFieldCheckStatus(status);
        break;
      }
    }

    setFieldValueLastChecked(fieldValueRef.current);
    setFieldChecking(false);

    if (onDoneRef.current) {
      onDoneRef.current();
      onDoneRef.current = null;
    }
  }

  const debouncedCheckField = useDebouncedCallback(checkField, debounce || 1);

  // If NOT checked, start a check and wait for it
  // If already checked, return immediately
  // If checking, wait for it
  // Return if the value passed validation
  // Used when the being checked value if required
  async function waitForCheck(forceRecheck?: boolean): Promise<boolean> {
    if (fieldValueLastChecked === null || fieldChecking || forceRecheck) {
      const promise = new Promise<void>(res => (onDoneRef.current = res));
      if (!fieldChecking || forceRecheck) checkField(true);
      await promise;
    }

    return fieldCheckStatusRef.current === true;
  }

  function getUIValidateStatus() {
    if (fieldChecking) return "validating";
    else if (typeof fieldCheckStatus === "string") return "error";
    else if (fieldCheckStatus === true) return "success";
    else return "";
  }

  function getUIHelp() {
    if (typeof fieldCheckStatus === "string") {
      if (fieldCheckStatus.indexOf("\n") !== -1) return <div style={{ marginBottom: 6 }}>{fieldCheckStatus}</div>;
      else return fieldCheckStatus;
    }
    return null;
  }

  function getCurrentValue() {
    return fieldValueRef.current;
  }

  // FIXME: debouncedCheckField won't return a promise
  return [
    debounce ? async () => void debouncedCheckField() : checkField,
    waitForCheck,
    getUIValidateStatus,
    getUIHelp,
    getCurrentValue
  ];
}
