import userModel from "../models/userModel.js";
import { io } from '../server.js';

// fetch contacts list
const getContacts = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        res.json({ success: true, contacts: user.contacts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// add contact
const addContact = async (req, res) => {
    const { firstName, lastName, phoneNo } = req.body;

    try {
        const contactUser = await userModel.findOne({ phoneNo });
        if (!contactUser) {
            return res.json({ success: false, message: "Phone Number not registered on BuzzTalk!" });
        }

        const user = await userModel.findById(req.userId);
        const isAlreadyContact = user.contacts.some(contact => contact.phoneNo === phoneNo);
        if (isAlreadyContact) {
            return res.json({ success: false, message: "This phone number is already in your contacts!" });
        }

        if (user.phoneNo === phoneNo) {
            return res.json({ success: false, message: "ERROR!" });
        }

        const newContact = {
            contactId: contactUser._id,
            firstName: firstName,
            lastName: lastName,
            phoneNo: contactUser.phoneNo
        };

        user.contacts.push(newContact);
        await user.save();
        res.json({ success: true, message: "Contact Added!"});

        // Emit event to update only the user who added the contact
        io.to(req.userId).emit("contactAdded", newContact);

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// remove contact
const removeContact = async (req, res) => {
    const { phoneNo } = req.body;
    try {
        const user = await userModel.findById(req.userId);
        const contactIndex = user.contacts.findIndex(
            (contact) => contact.phoneNo === phoneNo
        );

        user.contacts.splice(contactIndex, 1);
        await user.save();
        res.json({ success: true, message: "Contact Deleted!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { getContacts, addContact, removeContact };
