import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
import profileRouter from './routes/profileRoute.js';
import contactsRouter from './routes/contactsRoute.js';
import conversationRouter from './routes/conversationRoute.js';
import groupChatRouter from './routes/groupChatRoute.js';

// App config
const app = express();
const server = http.createServer(app);

// Dynamically set the CORS origin based on environment
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
};

// Initialize Socket.io with dynamic CORS settings
export const io = new Server(server, corsOptions);

// Middleware
app.use(express.json());
app.use(cors());

// DB connection
connectDB();

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/conversation', conversationRouter);
app.use('/api/groupChat', groupChatRouter);

app.get('/', (req, res) => {
    res.send('API Working');
});

// Socket.io logic
io.on('connection', (socket) => {
    // console.log('A user connected:', socket.id);

    // User joins a private chat room using userId
    socket.on('join', (userId) => {
        socket.join(userId);
        // console.log(`User ${userId} joined room ${userId}`);
    });

    // User joins a group chat room using groupChatId
    socket.on('joinGroup', (groupChatId) => {
        socket.join(groupChatId);
        // console.log(`User joined group ${groupChatId}`);
    });

    // Send private or group chat message
    socket.on('sendMessage', async ({ senderId, receiverId, groupChatId, text, timestamp, token, conversationId }) => {
        try {
            let response = await fetch('http://localhost:4000/api/conversation/sendmsg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'token': token },
                body: JSON.stringify({ senderId, receiverId, text, timestamp, conversationId }),
            });

            const result = await response.json();

            if (result.success) {
                if (receiverId) {
                    // Send message to private chat
                    io.to(receiverId).emit('receiveMessage', { senderId, receiverId, text, timestamp, conversationId });
                } else if (groupChatId) {
                    // Send message to all members in the group chat room
                    io.to(groupChatId).emit('receiveGroupMessage', { senderId, groupChatId, text, timestamp, conversationId });
                }
            } else {
                console.log("Error sending message:", result.message);
            }
        } catch (error) {
            console.error("Socket error:", error);
        }
    });

    // Send file in private or group chat
    socket.on('sendFile', async ({ senderId, receiverId, groupChatId, fileUrl, fileType, timestamp, conversationId }) => {
        try {
            if (receiverId) {
                // Send file message to private chat
                io.to(receiverId).emit('receiveMessage', { senderId, receiverId, fileUrl, fileType, timestamp, conversationId });
            } else if (groupChatId) {
                // Send file message to all members in the group chat room
                io.to(groupChatId).emit('receiveGroupMessage', { senderId, groupChatId, fileUrl, fileType, timestamp, conversationId });
            }
        } catch (error) {
            console.error("Socket error:", error);
        }
    });

    // Listen for new group chats (notify all group members)
    socket.on("newGroupChat", ({ groupChat, members }) => {
        members.forEach((memberId) => {
            io.to(memberId).emit("groupChatCreated", groupChat); // Notify all members
        });
    });

    socket.on('disconnect', () => {
        // console.log('User disconnected:', socket.id);
    });
});

const port = process.env.PORT || 4000;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server started on http://localhost:${port}`);
});
