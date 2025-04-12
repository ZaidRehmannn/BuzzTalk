import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import authMiddleware from '../middleware/auth.js';
import { getMessages, sendMessage, getLastMessages, getUserConversations, markMessagesAsRead, getAllUnreadMessages, createConversation, sendFile } from '../controllers/conversationController.js';

const conversationRouter = express.Router();

// Custom storage to preserve original filename with unique ID
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        try {
            const uniqueId = uuidv4().slice(0, 8);
            const originalName = path.parse(file.originalname).name;
            const ext = path.extname(file.originalname).toLowerCase();
            const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(ext);

            const filename = `${originalName}_${uniqueId}${isImage ? '' : ext}`;

            return {
                folder: 'BuzzTalk-ChatFiles',
                public_id: filename,
                resource_type: isImage ? 'auto' : 'raw',
                use_filename: false,
                unique_filename: false,
                type: 'upload'
            };
        } catch (err) {
            console.error("Error in CloudinaryStorage params:", err);
            throw err;
        }
    }
});

const upload = multer({ storage });

conversationRouter.post('/sendmsg', authMiddleware, sendMessage);
conversationRouter.post('/sendfile', authMiddleware, upload.single('file'), sendFile);
conversationRouter.post('/getmsgs', authMiddleware, getMessages);
conversationRouter.post('/getlastmsgs', authMiddleware, getLastMessages);
conversationRouter.post('/getuserconvos', authMiddleware, getUserConversations);
conversationRouter.post('/readmsgs', authMiddleware, markMessagesAsRead);
conversationRouter.post('/allunreadmsgs', authMiddleware, getAllUnreadMessages);
conversationRouter.post('/createconvo', authMiddleware, createConversation);

export default conversationRouter;