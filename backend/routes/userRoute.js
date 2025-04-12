import express from 'express';
import { loginUser, registerUser, fetchUsers } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/getusers', fetchUsers);

export default userRouter;