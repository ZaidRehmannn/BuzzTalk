import conversationModel from "../models/conversationModel.js";
import userModel from "../models/userModel.js";

// send message in a conversation
const sendMessage = async (req, res) => {
    const { receiverId, text, timestamp, conversationId } = req.body;
    const senderId = req.userId;

    try {
        let conversation = await conversationModel.findById(conversationId);
        if (!conversation) {
            conversation = new conversationModel({
                participants: [senderId, receiverId],
                messages: []
            });
        }

        const newMessage = {
            senderId,
            text,
            timestamp,
            seenBy: [senderId] // Message is seen only by the sender initially
        };

        conversation.messages.push(newMessage);

        // Update unread messages for other users
        conversation.participants.forEach(participantId => {
            if (participantId.toString() !== senderId.toString()) {
                conversation.unreadMessages.set(
                    participantId.toString(),
                    (conversation.unreadMessages.get(participantId.toString()) || 0) + 1
                );
            }
        });

        await conversation.save();
        res.status(200).json({ success: true, message: "Message sent" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// send image, pdf or other files in a message
const sendFile = async (req, res) => {
    const { receiverId, timestamp, conversationId } = req.body;
    const senderId = req.userId;
    let fileUrl = null;
    let fileType = null;

    try {
        if (req.file) {
            fileUrl = req.file.path;
            fileType = req.file.mimetype;
        }

        let conversation = await conversationModel.findById(conversationId);
        if (!conversation) {
            conversation = new conversationModel({
                participants: [senderId, receiverId],
                messages: []
            });
        }

        const newMessage = {
            senderId,
            fileUrl,
            fileType,
            timestamp,
            seenBy: [senderId] // Message is seen only by the sender initially
        };

        conversation.messages.push(newMessage);

        // Update unread messages for other users
        conversation.participants.forEach(participantId => {
            if (participantId.toString() !== senderId.toString()) {
                conversation.unreadMessages.set(
                    participantId.toString(),
                    (conversation.unreadMessages.get(participantId.toString()) || 0) + 1
                );
            }
        });

        await conversation.save();
        res.status(200).json({ success: true, message: "File sent", fileUrl });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// mark messages as read when user opens a chat
const markMessagesAsRead = async (req, res) => {
    const { conversationId } = req.body;
    const userId = req.userId;

    try {
        const conversation = await conversationModel.findById(conversationId);

        // Reset unread messages count for the user
        conversation.unreadMessages.set(userId.toString(), 0);

        // Mark all messages as seen by this user
        conversation.messages.forEach(message => {
            if (!message.seenBy.includes(userId)) {
                message.seenBy.push(userId);
            }
        });

        await conversation.save();
        res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// get all unread messages for initial rendering
const getAllUnreadMessages = async (req, res) => {
    const userId = req.userId;

    try {
        const conversations = await conversationModel.find({ participants: userId });
        const unreadMessagesCount = {};

        conversations.forEach((conversation) => {
            const count = conversation.unreadMessages.get(userId.toString()) || 0;
            unreadMessagesCount[conversation._id] = count;
        });

        res.status(200).json({ success: true, unreadMessagesCount });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// fetch messages in a conversation
const getMessages = async (req, res) => {
    const { conversationId } = req.body;

    try {
        const conversation = await conversationModel.findById(conversationId);
        if (conversation.messages.length === 0) {
            return res.status(200).json({ success: true, messages: [] });
        }

        const sortedMessages = conversation.messages.sort((a, b) => a.timestamp - b.timestamp);
        res.status(200).json({ success: true, messages: sortedMessages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// fetch last messages of each conversation associated with a specific user
const getLastMessages = async (req, res) => {
    try {
        const userId = req.userId;

        const conversations = await conversationModel.find({ participants: userId })
            .select("messages")
            .lean();

        const lastMessages = {};
        conversations.forEach((conversation) => {
            if (conversation.messages.length > 0) {
                const lastMessage = conversation.messages[conversation.messages.length - 1];

                let displayText = lastMessage.text;

                if (!displayText && lastMessage.fileUrl) {
                    const filename = lastMessage.fileUrl.split('/').pop();
                    const cleanFileName = filename.replace(/_[a-zA-Z0-9]{8}(?=\.[^.]+$)/, '');
                    displayText = decodeURIComponent(cleanFileName);
                }

                lastMessages[conversation._id] = {
                    text: displayText,
                    senderId: lastMessage.senderId,
                    timestamp: lastMessage.timestamp,
                };
            } else {
                lastMessages[conversation._id] = null;
            }
        });

        res.status(200).json({ success: true, lastMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// get user conversations
const getUserConversations = async (req, res) => {
    const userId = req.userId;
    try {
        const conversations = await conversationModel.find({ participants: userId });
        const user = await userModel.findById(userId);

        const enhancedConversations = await Promise.all(conversations.map(async (conversation) => {
            const conversationObj = conversation.toObject();

            if (!conversationObj.groupName) {
                const otherPersonId = conversationObj.participants.find(
                    participantId => participantId.toString() !== userId.toString()
                );

                let otherPerson = await userModel.findById(otherPersonId);
                let contact = user.contacts.find(
                    (contact) => contact.contactId.toString() === otherPersonId.toString()
                );                

                const PersonImage = otherPerson?.image || "";

                if (contact) {
                    contact = { ...contact.toObject?.(), notContact: false, conversationId: conversation._id, image: PersonImage };
                    conversationObj.participant = contact;
                } else {
                    otherPerson = { ...otherPerson.toObject(), notContact: true, conversationId: conversation._id };
                    conversationObj.participant = otherPerson;
                }
            }

            return conversationObj;
        }));

        res.status(200).json({ success: true, enhancedConversations });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// create new conversation
const createConversation = async (req, res) => {
    const userId = req.userId;
    const { phoneNo } = req.body;

    try {
        const otherUser = await userModel.findOne({ phoneNo });

        if (!otherUser) {
            return res.status(404).json({ success: false, message: "Phone Number Not Registered on BuzzTalk!" });
        }

        if (otherUser._id.toString() === userId.toString()) {
            return res.status(400).json({ success: false, message: "Cannot chat with yourself!" });
        }

        const existingConversation = await conversationModel.findOne({
            participants: { $all: [userId, otherUser._id] },
            groupName: null
        });

        if (existingConversation) {
            return res.status(409).json({ success: false, message: "Chat already exists!" });
        }

        const newConversation = new conversationModel({
            participants: [userId, otherUser._id]
        });

        await newConversation.save();
        res.status(201).json({ success: true, message: "New Chat Created!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { getMessages, sendMessage, getLastMessages, getUserConversations, markMessagesAsRead, getAllUnreadMessages, createConversation, sendFile };
