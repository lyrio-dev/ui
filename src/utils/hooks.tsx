import React, { useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import { Modal, ModalProps } from "semantic-ui-react";
import { useDebouncedCallback } from "use-debounce";
import { useNavigation, useCurrentRoute } from "react-navi";
import SocketIO from "socket.io-client";
import { appConfig } from "@/appConfig";

export function useIntlMessage() {
  const intl = useIntl();
  return Object.assign(
    (id: string, values?: Record<string, string>) =>
      intl.formatMessage(
        {
          id
        },
        values
      ),
    intl
  );
}

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

  const [debouncedCheckField] = useDebouncedCallback(checkField, debounce || 1);

  // If NOT checked, start a check and wait for it
  // If already checked, return immediately
  // If checking, wait for it
  // Return if the value passed validation
  // Used when the being checked value if required
  async function waitForCheck(forceRecheck?: boolean): Promise<boolean> {
    if (fieldValueLastChecked === null || fieldChecking || forceRecheck) {
      const promise = new Promise(res => (onDoneRef.current = res));
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

  return [debounce ? debouncedCheckField : checkField, waitForCheck, getUIValidateStatus, getUIHelp, getCurrentValue];
}

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

export function useDialog(
  props: ModalProps,
  header: React.ReactNode | (() => React.ReactNode),
  content: React.ReactNode | (() => React.ReactNode),
  actions: React.ReactNode | (() => React.ReactNode)
) {
  const [open, setOpen] = useState(false);
  return {
    element: (
      <Modal {...props} open={open}>
        {open && (typeof header === "function" ? header() : header)}
        <Modal.Content>{open && (typeof content === "function" ? content() : content)}</Modal.Content>
        <Modal.Actions>{open && (typeof actions === "function" ? actions() : actions)}</Modal.Actions>
      </Modal>
    ),
    isOpen: open,
    open: () => setOpen(true),
    close: () => setOpen(false)
  };
}

export function useConfirmUnload(getIfConfirm: () => boolean) {
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (getIfConfirm()) e.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  });
}

export function useLoginOrRegisterNavigation(bindLoginOrRegister?: "login" | "register") {
  const navigation = useNavigation();
  const currentRoute = useCurrentRoute();

  return (loginOrRegister?: "login" | "register") => {
    if (!loginOrRegister) loginOrRegister = bindLoginOrRegister;

    // Save the current url for redirecting back
    let loginRedirectUrl: string;
    if (currentRoute.url.pathname !== "/login" && currentRoute.url.pathname !== "/register") {
      loginRedirectUrl = currentRoute.url.pathname + currentRoute.url.search + currentRoute.url.hash;
    } else {
      loginRedirectUrl = currentRoute.url.query.loginRedirectUrl;
    }

    navigation.navigate({
      pathname: "/" + loginOrRegister,
      query: loginRedirectUrl && {
        loginRedirectUrl
      }
    });
  };
}

export function useSocket(
  namespace: string,
  query: Record<string, string>,
  onInit: (socket: SocketIOClient.Socket) => void,
  onConnect: (socket: SocketIOClient.Socket) => void,
  useOrNot: boolean
): SocketIOClient.Socket {
  const refSocket = useRef<SocketIOClient.Socket>(null);

  useEffect(() => {
    if (useOrNot) {
      refSocket.current = SocketIO(appConfig.apiEndpoint + namespace, {
        path: "/api/socket",
        transports: ["websocket"],
        query: query
      });
      refSocket.current.on("error", (err: any) => console.log("SocketIO error:", err));
      refSocket.current.on("disconnect", (reason: number) => console.log("SocketIO disconnect:", reason));
      refSocket.current.on("reconnect", (attempt: number) => console.log("SocketIO reconnect:", attempt));
      refSocket.current.on("connect", () => onConnect(refSocket.current));
      onInit(refSocket.current);
      return () => refSocket.current.disconnect();
    }
  }, []);

  return refSocket.current;
}
