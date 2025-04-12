import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// fetch users
const fetchUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, "_id phoneNo firstName lastName image");
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// login user
const loginUser = async (req, res) => {
    const { loginIdentifier, password } = req.body;

    try {
        const user = await userModel.findOne({
            $or: [{ email: loginIdentifier }, { phoneNo: loginIdentifier }],
        });
        if (!user) {
            return res.json({ success: false, message: "User doesn't Exist!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Password!" });
        }

        const token = createToken(user._id);
        res.json({ success: true, token });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// register user
const registerUser = async (req, res) => {
    const { firstName, lastName, email, phoneNo, password } = req.body;

    try {
        // Check if the user with the given email or phone number already exists
        const exists = await userModel.findOne({
            $or: [{ email: email }, { phoneNo: phoneNo }]
        });

        if (exists) {
            if (exists.email === email) {
                return res.json({ success: false, message: "Email already in use!" });
            }
            else if (exists.phoneNo === phoneNo) {
                return res.json({ success: false, message: "Phone Number already in use!" });
            }
        }

        // validating email and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email!" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long!" });
        }
        if (!/\d/.test(password)) {
            return res.json({ success: false, message: "Password must contain at least one digit!" });
        }

        // Validate phone number format
        if (!/^\d+$/.test(phoneNo)) {
            return res.json({ success: false, message: "Phone number must contain only digits!" });
        }
        if (phoneNo[0] !== '0') {
            return res.json({ success: false, message: "Phone number must start with 0!" });
        }
        if (phoneNo.length !== 11) {
            return res.json({ success: false, message: "Please enter a valid phone number!" });
        }

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new userModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNo: phoneNo,
            password: hashedPassword
        });

        newUser.save();
        res.json({ success: true, message: "Account created succesfully!" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { loginUser, registerUser, fetchUsers };