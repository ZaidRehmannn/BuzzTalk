import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export const socket = io(SOCKET_URL, { autoConnect: false });

export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
        socket.emit("join", userId);
    }
};