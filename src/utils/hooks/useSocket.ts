import { useRef, useEffect } from "react";
import SocketIO from "socket.io-client";

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
      refSocket.current = SocketIO(window.apiEndpoint + namespace, {
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
