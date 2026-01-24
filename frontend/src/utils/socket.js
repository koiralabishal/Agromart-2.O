import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Adjust for production

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (userId, role) => {
  if (!userId) return;

  if (!socket.connected) {
    socket.connect();
  }

  // Always register listener for connect/reconnect to ensure room joining
  socket.off("connect"); // prevent duplicates
  socket.on("connect", () => {
    console.log(">>> Socket connected:", socket.id);
    socket.emit("join-room", { userId: String(userId), role });
    console.log(">>> Sent join-room for:", userId, "with role:", role);
  });

  // If already connected, join immediately
  if (socket.connected) {
    socket.emit("join-room", { userId: String(userId), role });
    console.log(">>> Already connected, sent join-room for:", userId, "with role:", role);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log(">>> Socket disconnected manually");
  }
};
