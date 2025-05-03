import conversationModel from "../models/conversationModel.js";
import userModel from "../models/userModel.js";
import cloudinary from '../config/cloudinary.js';
import { io } from '../server.js';

// create a group chat
const createGroup = async (req, res) => {
    try {
        const { groupName, members } = req.body;
        const adminId = req.userId;

        const participantIds = [
            ...members.map(member => member.contactId),
            adminId
        ];

        const newGroup = await conversationModel.create({
            participants: participantIds,
            groupName,
            groupImage: null,
            admins: [adminId],
            messages: []
        });

        await userModel.updateMany(
            { _id: { $in: participantIds } },
            { $push: { groupChats: { groupChatId: newGroup._id, groupChatName: groupName } } }
        );

        res.status(201).json({ success: true, message: "Group created successfully!" });

        participantIds.forEach(memberId => {
            io.to(memberId).emit("groupChatAdded", newGroup);
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// fetch all group chats associated with a user
const getGroupChats = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        res.status(200).json({ success: true, groupChats: user.groupChats });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// fetch all group chats details
const getGroupChatDetails = async (req, res) => {
    try {
        const groupChats = await conversationModel.find({ groupName: { $ne: null } });
        res.status(200).json({ success: true, groupChatDetails: groupChats });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// upload or change group picture
const uploadImage = async (req, res) => {
    const { groupChatId } = req.body;
    try {
        let group = await conversationModel.findById(groupChatId);
        if (group.groupImage) {
            const publicId = group.groupImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`BuzzTalk-GroupPics/${publicId}`);
        }
        let image_filename = req.file.path;
        group.groupImage = image_filename;
        await group.save();

        const users = await userModel.find({ "groupChats.groupChatId": group._id });
        for (let user of users) {
            let groupChatToUpdate = user.groupChats.find(chat => chat.groupChatId.equals(group._id));
            if (groupChatToUpdate) {
                groupChatToUpdate.image = image_filename;
                await user.save();
            }
        }

        res.status(200).json({ success: true, image_filename });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// remove group picture
const removeImage = async (req, res) => {
    const { groupChatId } = req.body;
    try {
        let group = await conversationModel.findById(groupChatId);
        if (group.groupImage) {
            const publicId = group.groupImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`BuzzTalk-GroupPics/${publicId}`);
            group.groupImage = "";
        }
        await group.save();
        res.status(200).json({ success: true, message: "Profile Picture Removed!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

const updateGroupChatDetails = async (req, res) => {
    const { groupChatId, groupName, newAdmin, newMember } = req.body;
    try {
        let group = await conversationModel.findById(groupChatId);
        if (groupName) {
            group.groupName = groupName;
            const users = await userModel.find({ "groupChats.groupChatId": group._id });
            for (let user of users) {
                let groupChatToUpdate = user.groupChats.find(chat => chat.groupChatId.equals(group._id));
                if (groupChatToUpdate) {
                    groupChatToUpdate.groupChatName = groupName;
                    await user.save();
                }
            }
        }
        if (newAdmin) {
            group.admins.push(newAdmin);
        }
        if (newMember) {
            group.participants.push(newMember);
            const user = await userModel.findById(newMember);
            user.groupChats.push({ groupChatId: group._id, groupChatName: group.groupName, image: group.groupImage });
            await user.save();
        }
        await group.save();
        res.status(200).json({ success: true, message: "Info Updated!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

const removeAdminMember = async (req, res) => {
    const { groupChatId, removeAdmin, removeMember } = req.body;
    try {
        let group = await conversationModel.findById(groupChatId);
        if (removeAdmin) {
            group.admins = group.admins.filter(admin => admin.toString() !== removeAdmin);
        }
        if (removeMember) {
            group.participants = group.participants.filter(member => member.toString() !== removeMember);
        }
        await group.save();
        res.status(200).json({ success: true, message: "Info Updated!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

const removeGroupChat = async (req, res) => {
    const { userId, groupChatId } = req.body;
    try {
        const user = await userModel.findById(userId);
        user.groupChats = user.groupChats.filter(group => group.groupChatId.toString() !== groupChatId);
        await user.save();
        res.status(200).json({ success: true, message: "Group chat removed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

export {
    createGroup,
    getGroupChats,
    getGroupChatDetails,
    uploadImage,
    removeImage,
    updateGroupChatDetails,
    removeAdminMember,
    removeGroupChat
};
