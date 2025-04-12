import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    text: { type: String, default: null },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
});

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    messages: [messageSchema],
    unreadMessages: {
        type: Map,
        of: Number,
        default: {}
    },
    groupName: { type: String, default: null },
    groupImage: { type: String },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
}, { timestamps: true });

const conversationModel = mongoose.models.conversation || mongoose.model('conversation', conversationSchema);

export default conversationModel;
