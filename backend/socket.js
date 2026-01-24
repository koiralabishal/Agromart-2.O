import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`>>> Socket connected: ${socket.id}`);

    socket.on("join-room", ({ userId, role }) => {
      if (userId) {
        const userIdStr = String(userId);
        socket.join(userIdStr);
        console.log(`>>> User ${userIdStr} joined their private room`);

        if (role) {
          socket.join(role);
          console.log(`>>> User ${userIdStr} joined role room: ${role}`);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`>>> Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Global broadcast to everyone
export const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`>>> Broadcasted ${event} to everyone`);
  }
};

// Emit to a specific role (e.g., all "collector" users)
export const emitToRole = (role, event, data) => {
  if (io && role) {
    io.to(role).emit(event, data);
    console.log(`>>> Emitted ${event} to role: ${role}`);
    
    // Always CC Admin
    if (role !== "admin") {
      io.to("admin").emit(event, data);
    }
  }
};

// Emit to a specific user and CC Admin
export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    const userIdStr = String(userId);
    io.to(userIdStr).emit(event, data);
    console.log(`>>> Emitted ${event} to user ${userIdStr}`);

    // Always CC Admin for full dashboard sync
    io.to("admin").emit(event, data);
  }
};
