import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { userInfo, uploadImage, removeImage, updateInfo, updatePassword } from '../controllers/profileController.js';
import authMiddleware from '../middleware/auth.js';

const profileRouter = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'BuzzTalk-ProfilePics',
        allowedFormats: ['jpeg', 'png', 'jpg'],
    },
});

const upload = multer({ storage });

profileRouter.post('/info', authMiddleware, userInfo);
profileRouter.post('/addimage', authMiddleware, upload.single("image"), uploadImage);
profileRouter.post('/removeimage', authMiddleware, removeImage);
profileRouter.post('/updateinfo', authMiddleware, updateInfo)
profileRouter.post('/updatepassword', authMiddleware, updatePassword)

export default profileRouter;