import React, { createContext, useContext, useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../utils/socket";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return {
        userId: user?._id || user?.id,
        role: user?.role
      };
    } catch (e) {
      return { userId: null, role: null };
    }
  });

  useEffect(() => {
    const handleUserChange = () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        setUserInfo({
          userId: user?._id || user?.id,
          role: user?.role
        });
      } catch (e) {
        setUserInfo({ userId: null, role: null });
      }
    };

    window.addEventListener("storage", handleUserChange);
    window.addEventListener("userUpdated", handleUserChange);

    return () => {
      window.removeEventListener("storage", handleUserChange);
      window.removeEventListener("userUpdated", handleUserChange);
    };
  }, []);

  useEffect(() => {
    if (userInfo.userId) {
      console.log(">>> [SocketProvider] Initiating connection for:", userInfo.userId, "Role:", userInfo.role);
      connectSocket(userInfo.userId, userInfo.role);
      return () => {
        console.log(">>> [SocketProvider] Disconnecting for:", userInfo.userId);
        disconnectSocket();
      };
    }
  }, [userInfo.userId, userInfo.role]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
