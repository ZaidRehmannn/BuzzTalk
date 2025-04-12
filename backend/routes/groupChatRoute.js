import express from "express";
import authMiddleware from '../middleware/auth.js';
import { createGroup, getGroupChats, getGroupChatDetails, uploadImage, removeImage, updateGroupChatDetails, removeAdminMember, removeGroupChat } from '../controllers/groupChatController.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const groupChatRouter = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'BuzzTalk-GroupPics',
        allowedFormats: ['jpeg', 'png', 'jpg'],
    },
});

const upload = multer({ storage });

groupChatRouter.post('/create', authMiddleware, createGroup);
groupChatRouter.post('/list', authMiddleware, getGroupChats);
groupChatRouter.post('/details', authMiddleware, getGroupChatDetails);
groupChatRouter.post('/addimage', authMiddleware, upload.single("image"), uploadImage);
groupChatRouter.post('/removeimage', authMiddleware, removeImage);
groupChatRouter.post('/updateinfo', authMiddleware, updateGroupChatDetails)
groupChatRouter.post('/removemembers', authMiddleware, removeAdminMember)
groupChatRouter.post('/removegroup', authMiddleware, removeGroupChat)

export default groupChatRouter;