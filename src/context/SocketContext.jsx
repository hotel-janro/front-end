import React, { createContext, useContext } from "react";
import { io } from "socket.io-client";
import { API_HOST } from "../api.js";

const SocketContext = createContext(null);

// Initialize socket exactly once at the module level.
// This prevents multiple connect/disconnect loops caused by React 18 StrictMode (mount -> unmount -> remount)
// or component re-renders.
const socketInstance = io(API_HOST, {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
});

socketInstance.on("connect", () => {
  console.log("🔌 Connected to Socket.io server:", socketInstance.id);
});

socketInstance.on("disconnect", (reason) => {
  console.log("🔌 Disconnected from Socket.io server. Reason:", reason);
});

export function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  return useContext(SocketContext);
}
