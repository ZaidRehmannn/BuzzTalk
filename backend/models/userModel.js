import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    contacts: [
        {
            contactId: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            phoneNo: { type: String, required: true, unique: true },
            image: { type: String }
        }
    ],
    groupChats: [
        {
            groupChatId: { type: mongoose.Schema.Types.ObjectId, ref: "conversation" },
            groupChatName: { type: String, default: null },
            image: { type: String, default: null }
        }
    ]
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
