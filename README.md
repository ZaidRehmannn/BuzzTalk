# 💬 BuzzTalk

BuzzTalk is a real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It offers seamless one-on-one and group messaging functionality with a modern, responsive user interface. The app uses Socket.IO for real-time communication, JWT for secure authentication, and integrates Cloudinary for efficient profile image management.

## 🚀 **Features**  

BuzzTalk is packed with features designed to make communication seamless, fast, and enjoyable. Here’s a detailed breakdown of what it offers:  

- **Real-time Messaging:**  
  Enjoy instant, real-time one-on-one and group chats powered by **Socket.IO**, ensuring your messages are delivered without delay.  

- **Group Chats:**  
  Easily create and manage group conversations, making it perfect for staying connected with friends, family, or teams.  

- **User Authentication:**  
  Secure and reliable registration and login, backed by **JWT (JSON Web Tokens)** for strong, server-side authentication and user verification.  

- **User Profiles:**  
  Personalized user profiles with customizable avatars, securely stored and managed using **Cloudinary** for fast and scalable media delivery.  

- **File Sharing:**  
  Share images, documents, and other files directly within your chats, enhancing collaboration and communication.  

- **Responsive UI:**  
  A fully responsive, mobile-friendly design built with **Tailwind CSS**, enhanced with **Framer Motion** for fluid, eye-catching animations that make the user experience engaging and intuitive.  

## 🛠️ Tech Stack

### Frontend

- **React.js**: Component-based UI library.
- **Tailwind CSS**: Utility-first CSS framework for responsive design.
- **Framer Motion**: Animation library for React to enhance user interactions.
- **Axios**: Promise-based HTTP client for API calls.
- **React Router**: Declarative routing for React applications.

### Backend

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing user and chat data.
- **Mongoose**: ODM for MongoDB, providing a schema-based solution.
- **Socket.IO**: Enables real-time, bi-directional communication.
- **JWT (JSON Web Tokens)**: Secure authentication mechanism.
- **Cloudinary**: Cloud-based image and video management.

## User Interface Overview

Here’s a visual overview of the key sections of the app:

### **1. Home / Login / Signup Page**  
Users can register a new account or log in to their existing account to start chatting.  

![Login or Signup Page](./screenshots/HomePage.PNG)  

### **2. Main Chat Page**  
The main hub for chatting with your contacts and groups.  

![Main Chat Page](./screenshots/ChatPage.PNG)  

### **3. Add Group Chat Popup**  
Create a new group chat to stay connected with multiple people.  

![Add Group Chat Popup](./screenshots/AddGroupChat.PNG)  

### **4. Add New Chat Popup**  
Start a conversation with a new contact quickly.  

![Add New Chat Popup](./screenshots/AddNewChat.PNG)  

### **5. My Contacts Popup**  
Manage your contact list and add new friends.  

![My Contacts Popup](./screenshots/MyContacts.PNG)  

### **6. Profile Information Popup**  
View and edit your profile information.  

![Profile Information Popup](./screenshots/ProfileInfo.PNG)  

## 🎥 Demo Video

Watch the full demonstration of BuzzTalk in action:  
[![BuzzTalk Demo Video](https://www.loom.com/share/9df227d976c54acb9589b00af960d139?sid=6b1e25fd-0c5b-4d2f-9dd5-d3f1f64b6000)

## Demo Accounts

To test the app without needing to create your own account, you can use the following demo accounts:

1. **Account 1:**
   - **Email:** liam.carter@demo.com
   - **Password:** password12345

2. **Account 2:**
   - **Email:** ethan.walker@demo.com
   - **Password:** password12345

3. **Account 3:**
   - **Email:** noah.bennett@demo.com
   - **Password:** password12345

Feel free to log in with any of these accounts to explore the features of the app!

## 📦 Installation

To run this project locally, follow these steps:

### Prerequisites

- Node.js and npm installed
- MongoDB instance (local or cloud-based)
- Cloudinary account for image uploads

### Clone the Repository

```bash
git clone https://github.com/ZaidRehmannn/BuzzTalk.git
cd BuzzTalk
```

---

### 🔧 Backend Setup

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the `backend` directory and add the following:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the backend server**:

   ```bash
   npm run server
   ```

   The backend server will start on `http://localhost:4000`.

---

### 🌐 Frontend Setup

1. **Navigate to the frontend directory**:

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the frontend development server**:

   ```bash
   npm run dev
   ```

   The frontend will be accessible at `http://localhost:5173`.

---

Now, you can use BuzzTalk locally with full functionality, including real-time messaging and animated UI interactions.
