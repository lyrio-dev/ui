import React, { useEffect, useRef, useState } from "react";
import type { PermissionManagerProps } from "./PermissionManager";

export type { PermissionManagerProps } from "./PermissionManager";

const LazyPermissionManager: React.FC<PermissionManagerProps> = props => {
  const [PermissionManagerComponent, setPermissionManagerComponent] = useState<React.FC<PermissionManagerProps>>();

  const [loading, setLoading] = useState(false);
  const refFirstTimeMounted = useRef<boolean>();
  const refFirstOpenPromiseResolve = useRef<() => void>();

  useEffect(() => {
    if (!refFirstTimeMounted.current) {
      const open = async () => {
        if (loading) return;
        setLoading(true);

        const promise = new Promise<boolean>(resolve => (refFirstOpenPromiseResolve.current = resolve));

        try {
          setPermissionManagerComponent((await import("./PermissionManager")).default);
        } catch (e) {
          console.log(e);
        }

        setLoading(false);

        return await promise;
      };

      if (typeof props.refOpen === "function") props.refOpen(open);
      else (props.refOpen as React.MutableRefObject<() => Promise<boolean>>).current = open;
    }
  }, [props.refOpen]);

  return PermissionManagerComponent ? (
    <PermissionManagerComponent
      {...props}
      refOpen={open => {
        if (typeof props.refOpen === "function") props.refOpen(open);
        else (props.refOpen as React.MutableRefObject<() => Promise<boolean>>).current = open;

        if (!refFirstTimeMounted.current) {
          refFirstTimeMounted.current = true;
          open().then(refFirstOpenPromiseResolve.current);
        }
      }}
    />
  ) : null;
};

export default LazyPermissionManager;
