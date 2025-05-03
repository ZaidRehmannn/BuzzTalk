import userModel from "../models/userModel.js";
import { io } from '../server.js';

// fetch contacts list
const getContacts = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        res.status(200).json({ success: true, contacts: user.contacts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// add contact
const addContact = async (req, res) => {
    const { firstName, lastName, phoneNo } = req.body;

    try {
        const contactUser = await userModel.findOne({ phoneNo });
        if (!contactUser) {
            return res.status(404).json({ success: false, message: "Phone Number not registered on BuzzTalk!" });
        }

        const user = await userModel.findById(req.userId);
        const isAlreadyContact = user.contacts.some(contact => contact.phoneNo === phoneNo);
        if (isAlreadyContact) {
            return res.status(409).json({ success: false, message: "This phone number is already in your contacts!" });
        }

        if (user.phoneNo === phoneNo) {
            return res.status(400).json({ success: false, message: "ERROR! Cannot add yourself as a contact." });
        }

        const newContact = {
            contactId: contactUser._id,
            firstName: firstName,
            lastName: lastName,
            phoneNo: contactUser.phoneNo
        };

        user.contacts.push(newContact);
        await user.save();
        res.status(201).json({ success: true, message: "Contact Added!" });

        // Emit event to update only the user who added the contact
        io.to(req.userId).emit("contactAdded", newContact);

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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

        if (contactIndex === -1) {
            return res.status(404).json({ success: false, message: "Contact not found!" });
        }

        user.contacts.splice(contactIndex, 1);
        await user.save();
        res.status(200).json({ success: true, message: "Contact Deleted!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { getContacts, addContact, removeContact };
