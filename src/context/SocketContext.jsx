import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_HOST } from "../api.js";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(API_HOST, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log("🔌 Connected to Socket.io server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Disconnected from Socket.io server");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
