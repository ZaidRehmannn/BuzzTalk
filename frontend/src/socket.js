import { io } from "socket.io-client";

const SOCKET_URL = "https://veil-mixed-music.glitch.me";

export const socket = io(SOCKET_URL, { autoConnect: false });

export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
        socket.emit("join", userId);
    }
};