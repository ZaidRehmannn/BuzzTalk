import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { addContact, getContacts, removeContact } from '../controllers/contactsController.js';

const contactsRouter = express.Router();

contactsRouter.post('/list', authMiddleware, getContacts);
contactsRouter.post('/add', authMiddleware, addContact);
contactsRouter.post('/remove', authMiddleware, removeContact);

export default contactsRouter;