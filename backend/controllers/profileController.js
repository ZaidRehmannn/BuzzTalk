import userModel from "../models/userModel.js";
import cloudinary from '../config/cloudinary.js';
import bcrypt from 'bcrypt';

// fetch user info
const userInfo = async (req, res) => {
    try {
        let userData = await userModel.findById(req.userId);
        res.status(200).json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// upload or change profile picture
const uploadImage = async (req, res) => {
    try {
        let user = await userModel.findById(req.userId);
        if (user.image) {
            const publicId = user.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`BuzzTalk-ProfilePics/${publicId}`);
        }
        let image_filename = req.file.path;
        user.image = image_filename;

        await user.save();
        res.status(200).json({ success: true, image_filename });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// remove profile picture
const removeImage = async (req, res) => {
    try {
        let user = await userModel.findById(req.userId);
        if (user.image) {
            const publicId = user.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`BuzzTalk-ProfilePics/${publicId}`);
            user.image = "";
        }
        await user.save();
        res.status(200).json({ success: true, message: "Profile Picture Removed!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// update user info
const updateInfo = async (req, res) => {
    try {
        let user = await userModel.findById(req.userId);
        if (req.body.firstName) {
            user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
            user.lastName = req.body.lastName;
        }
        await user.save();
        res.status(200).json({ success: true, message: "Info Updated!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// update password
const updatePassword = async (req, res) => {
    try {
        let user = await userModel.findById(req.userId);
        const { oldPassword, newPassword } = req.body;

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Old Password is Incorrect!" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }
        if (!/\d/.test(newPassword)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one digit" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ success: true, message: "Password Updated!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

export { userInfo, uploadImage, removeImage, updateInfo, updatePassword };
