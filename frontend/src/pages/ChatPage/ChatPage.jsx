import React, { useRef, useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faUser, faRightFromBracket, faMagnifyingGlass, faAddressBook, faPaperPlane, faArrowLeft, faUsers, faCircleInfo, faPhone, faVideo, faPlus, faPaperclip, faFile, faImage, faCircleMinus, faX, faCircleDown, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import LogoutPopup from '../../components/LogoutPopup/LogoutPopup.jsx';
import ProfilePopup from '../../components/ProfilePopup/ProfilePopup.jsx';
import MyContacts from '../../components/MyContacts/MyContacts.jsx';
import CreateGroup from '../../components/CreateGroup/CreateGroup.jsx';
import ContactInfo from '../../components/ContactInfo/ContactInfo.jsx';
import GroupInfo from '../../components/GroupInfo/GroupInfo.jsx';
import NewChatPopup from '../../components/NewChatPopup/NewChatPopup.jsx';
import { StoreContext } from '../../context/StoreContext.jsx';
import { socket, connectSocket } from '../../socket.js';
import axios from 'axios';

const ChatPage = () => {
  const { userData, fetchUserData, userContacts, fetchUserContacts, userGroupChats, fetchUserGroupChats, url, users, lastMessages, setlastMessages, fetchLastMessages, userConversations, unreadMessages, setunreadMessages, fetchAllUnreadMessages, fetchUserConversations, isAppLoading, resetStore } = useContext(StoreContext);
  const navigate = useNavigate();
  const inputRef = useRef();
  const logoutRef = useRef(null);
  const profileRef = useRef(null);
  const contactsRef = useRef(null);
  const groupChatRef = useRef(null);
  const attachmentRef = useRef(null);
  const [showLogoutTooltip, setshowLogoutTooltip] = useState(false);
  const [showProfileTooltip, setshowProfileTooltip] = useState(false);
  const [showContactsTooltip, setshowContactsTooltip] = useState(false);
  const [showGroupChatTooltip, setshowGroupChatTooltip] = useState(false);
  const [showAttachmentTooltip, setshowAttachmentTooltip] = useState(false);
  const [logoutPopup, setlogoutPopup] = useState(false);
  const [profilePopup, setprofilePopup] = useState(false);
  const [contactsPopup, setcontactsPopup] = useState(false);
  const [groupChatPopup, setgroupChatPopup] = useState(false);
  const [newChatPopup, setnewChatPopup] = useState(false);
  const [contact, setcontact] = useState(null);
  const [messages, setmessages] = useState([]);
  const [groupChat, setgroupChat] = useState(null);
  const [newMessage, setnewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showChat, setshowChat] = useState(false);
  const [contactInfoPopup, setcontactInfoPopup] = useState(false);
  const [groupInfoPopup, setgroupInfoPopup] = useState(false);
  const [userChats, setuserChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [attachment, setattachment] = useState(null);
  const [preview, setpreview] = useState(null);
  const [isImage, setisImage] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({});
  const [selectedPhoneNo, setSelectedPhoneNo] = useState("");
  const [isNewChat, setisNewChat] = useState(false);

  const focusInput = () => {
    inputRef.current.focus();
  };

  const logout = () => {
    localStorage.removeItem("token");
    resetStore();
    navigate("/", { replace: true });
  };

  const toggleLogoutTooltip = () => {
    setshowLogoutTooltip(!showLogoutTooltip);
    setshowProfileTooltip(false);
    setshowContactsTooltip(false);
    setshowGroupChatTooltip(false);
    setshowAttachmentTooltip(false);
  };

  const toggleProfileTooltip = () => {
    setshowProfileTooltip(!showProfileTooltip);
    setshowLogoutTooltip(false);
    setshowContactsTooltip(false);
    setshowGroupChatTooltip(false);
    setshowAttachmentTooltip(false);
  };

  const toggleContactsTooltip = () => {
    setshowContactsTooltip(!showContactsTooltip);
    setshowLogoutTooltip(false);
    setshowProfileTooltip(false);
    setshowGroupChatTooltip(false);
    setshowAttachmentTooltip(false);
  };

  const toggleGroupChatTooltip = () => {
    setshowGroupChatTooltip(!showGroupChatTooltip);
    setshowLogoutTooltip(false);
    setshowProfileTooltip(false);
    setshowContactsTooltip(false);
    setshowAttachmentTooltip(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutRef.current && !logoutRef.current.contains(event.target)) {
        setshowLogoutTooltip(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setshowProfileTooltip(false);
      }
      if (contactsRef.current && !contactsRef.current.contains(event.target)) {
        setshowContactsTooltip(false);
      }
      if (groupChatRef.current && !groupChatRef.current.contains(event.target)) {
        setshowGroupChatTooltip(false);
      }
      if (attachmentRef.current && !attachmentRef.current.contains(event.target)) {
        setshowAttachmentTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isAppLoading && userData?._id) {
      // Connect to socket and emit "join" event
      connectSocket(userData._id);
      socket.emit("join", userData._id);

      if (userGroupChats && userGroupChats.length > 0) {
        userGroupChats.forEach((groupChat) => {
          socket.emit("joinGroup", groupChat.groupChatId);
        });
      }

      // Handle Private Messages
      socket.on("receiveMessage", (data) => {
        if (!data.groupChatId) {
          if (contact && contact.conversationId === data.conversationId) {
            setmessages((prevMessages) => [...prevMessages, data]);
            markMessagesAsRead(data.conversationId);
          } else {
            fetchAllUnreadMessages();
          }

          try {
            playSound("/sounds/receive.mp3");
          } catch (err) {
            console.warn("Sound error:", err);
          }

          fetchLastMessages();
        }
      });

      // Handle Group Messages
      socket.on("receiveGroupMessage", (data) => {
        if (!data.receiverId) {
          if (data.senderId === userData._id) {
            return;
          }

          if (groupChat && groupChat.conversationId === data.conversationId) {
            setmessages((prevMessages) => [...prevMessages, data]);
            markMessagesAsRead(data.conversationId);
          } else {
            fetchAllUnreadMessages();
          }

          try {
            playSound("/sounds/receive.mp3");
          } catch (err) {
            console.warn("Sound error:", err);
          }

          fetchLastMessages();
        }
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("receiveGroupMessage");
      };
    }
  }, [isAppLoading, userData, userGroupChats, messages]);

  const sendMessage = (conversationId) => {
    const token = localStorage.getItem("token");
    if (token) {
      let messageData = {};
      if (newMessage.trim() !== "" && (contact || groupChat)) {
        const timestamp = new Date().toISOString();

        messageData = {
          senderId: userData._id,
          text: newMessage,
          timestamp,
          conversationId,
          token
        };

        if (contact) {
          messageData.receiverId = contact.notContact ? contact.id : contact.contactId;
        } else {
          messageData.groupChatId = groupChat.groupChatId;
        }

        playSound("/sounds/send.mp3");

        // Emit message through socket
        socket.emit("sendMessage", messageData);

        setmessages((prevMessages) => [...prevMessages, messageData]);
        setnewMessage("");

        setlastMessages((prevLastMessages) => ({
          ...prevLastMessages,
          [conversationId]: {
            text: newMessage,
            senderId: userData._id,
            timestamp
          }
        }));
      }
    }
  };

  const sendFile = async (conversationId) => {
    const token = localStorage.getItem("token");
    if (token) {
      const timestamp = new Date().toISOString();

      const formData = new FormData();
      formData.append("file", attachment);
      formData.append("senderId", userData._id);
      formData.append("conversationId", conversationId);
      formData.append("timestamp", timestamp);

      try {
        const response = await axios.post(url + '/api/conversation/sendfile', formData, { headers: { token, 'Content-Type': 'multipart/form-data' } });
        if (response.data.success) {
          let fileUrl = response.data.fileUrl;

          let messageData = {
            senderId: userData._id,
            fileUrl,
            fileType: attachment.type,
            timestamp,
            conversationId,
            token
          }
          if (contact) {
            messageData.receiverId = contact.notContact ? contact.id : contact.contactId;
          } else {
            messageData.groupChatId = groupChat.groupChatId;
          }

          // Emit socket event to notify others about the new file
          socket.emit("sendFile", messageData);

          playSound("/sounds/send.mp3");
          setmessages((prevMessages) => [...prevMessages, messageData]);

          setlastMessages((prevLastMessages) => ({
            ...prevLastMessages,
            [conversationId]: {
              text: attachment.name,
              senderId: userData._id,
              timestamp
            }
          }));

          setpreview(null);
        }
      } catch (error) {
        console.log("File upload error:", error);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setattachment(file);

      const isImage = file.type.startsWith("image/")
      setisImage(isImage);

      const reader = new FileReader();
      reader.onload = () => {
        setpreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFileName = (fileUrl) => {
    if (!fileUrl) return "";

    if (fileUrl.startsWith("http")) {
      // Extract the filename from the URL
      const filename = fileUrl.split('/').pop();
      // Remove the ID part from the filename
      const cleanFileName = filename.replace(/_[a-zA-Z0-9]{8}(?=\.[^.]+$)/, '');
      return decodeURIComponent(cleanFileName);
    }

    return fileUrl;
  };

  const getRawDownloadUrl = (url) => {
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  const downloadFile = async (url, filename, messageId) => {
    setDownloadStatus(prev => ({ ...prev, [messageId]: 'loading' }));

    try {
      const response = await fetch(getRawDownloadUrl(url));
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);

      setDownloadStatus(prev => ({ ...prev, [messageId]: 'success' }));
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed.");
      setDownloadStatus(prev => ({ ...prev, [messageId]: 'idle' }));
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await axios.post(url + '/api/conversation/readmsgs', { conversationId }, { headers: { token } });
      if (response.data.success) {
        setunreadMessages((prev) => ({
          ...prev,
          [conversationId]: 0,
        }));
      }
    }
  };

  const getContactChat = async (contact) => {
    if (!contact.notContact) {
      setcontact(contact);
      setgroupChat(null);
      setshowChat(true);
      const conversationId = contact.conversationId;
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.post(url + '/api/conversation/getmsgs', { conversationId }, { headers: { token } });
        if (response.data.success) {
          setmessages(response.data.messages);
        }
      }
      markMessagesAsRead(contact.conversationId);
    }
    else {
      let person = {
        id: contact._id,
        image: contact.image,
        phoneNo: contact.phoneNo,
        conversationId: contact.conversationId,
        notContact: contact.notContact
      }
      setcontact(person);
      setgroupChat(null);
      setshowChat(true);
      const conversationId = person.conversationId;
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.post(url + '/api/conversation/getmsgs', { conversationId }, { headers: { token } });
        if (response.data.success) {
          setmessages(response.data.messages);
        }
      }
      markMessagesAsRead(person.conversationId);
    }
  };

  const getGroupChat = async (groupChat) => {
    setgroupChat(groupChat);
    setcontact(null);
    setshowChat(true);
    const conversationId = groupChat.conversationId;
    const token = localStorage.getItem('token');
    if (token) {
      const response = await axios.post(url + '/api/conversation/getmsgs', { conversationId }, { headers: { token } });
      if (response.data.success) {
        setmessages(response.data.messages);
      }
    }
    markMessagesAsRead(groupChat.conversationId);
  };

  const userChatList = () => {
    if (!userConversations || !users || !userData || !userContacts) {
      return;
    }

    let chats = [];
    userConversations.forEach((conversation) => {
      let userChat = {
        image: "",
        name_phoneNo: "",
        lastMessageText: "",
        lastMessageTime: "",
        person_group: null,
        isGroup: false,
        unreadMessages: 0,
      };

      // Private Chat
      if (!conversation.groupName) {
        let person = conversation.participant;

        // If contact exists
        if(!person.notContact){
          userChat.image = person.image;
          userChat.name_phoneNo = `${person.firstName} ${person.lastName}`;
          userChat.person_group = person;
        } 
        // If not a contact (use phone number)
        else{
          userChat.image = person?.image || "";
          userChat.name_phoneNo = person.phoneNo;
          userChat.person_group = person;
        }

        // Set last message
        const lastMessage = lastMessages[conversation._id];
        if (lastMessage) {
          userChat.lastMessageText =
            lastMessage.senderId.toString() === userData._id.toString()
              ? `You: ${lastMessage.text}`
              : !person.notContact ? `${person.firstName}: ${lastMessage.text}` : `${person.phoneNo}: ${lastMessage.text}`
          userChat.lastMessageTime = lastMessage.timestamp;
        }

        // Unread messages count
        userChat.unreadMessages = unreadMessages[conversation._id];
      }
      // Group Chat
      else {
        userChat.image = conversation?.groupImage || "";
        userChat.name_phoneNo = conversation.groupName;

        let groupChat = userGroupChats.find((gc) => gc.groupChatId === conversation._id);
        groupChat = { ...groupChat, conversationId: conversation._id };
        userChat.person_group = groupChat;

        // Set last message
        const lastMessage = lastMessages[conversation._id];
        if (lastMessage) {
          const senderContact = userContacts.find((contact) => contact.contactId === lastMessage.senderId.toString());
          const senderPerson = users.find((user) => user._id.toString() === lastMessage.senderId.toString());
          userChat.lastMessageText =
            lastMessage.senderId.toString() === userData._id.toString()
              ? `You: ${lastMessage.text}`
              : senderContact ? `${senderContact.firstName}: ${lastMessage.text}` : `${senderPerson?.phoneNo}: ${lastMessage.text}`;
          userChat.lastMessageTime = lastMessage.timestamp;
        }

        // Unread messages count
        userChat.unreadMessages = unreadMessages[conversation._id];
        userChat.isGroup = true;
      }

      chats.push(userChat);
    });

    // Sort chats by last message time (descending)
    chats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    // Apply Filtering Based on Search Term
    const filteredChats = searchTerm
      ? chats.filter((chat) =>
        chat.name_phoneNo.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : chats;

    setuserChats(filteredChats);
  };

  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio.play().catch((err) => console.warn("Audio play prevented:", err));
  };

  const goBackToContacts = () => {
    setshowChat(false);
    setcontact(null);
    setgroupChat(null);
    setmessages([]);
    setnewMessage("");
  };

  useEffect(() => {
    if (!userData) {
      fetchUserData();
      fetchUserContacts();
      fetchUserGroupChats();
      fetchUserConversations();
      fetchAllUnreadMessages();
      fetchLastMessages();
    }
  }, []);

  useEffect(() => {
    if (userConversations && users && userData && userContacts) {
      userChatList();
    }
  },
    [userConversations, users, userData, userContacts, lastMessages, unreadMessages, searchTerm]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 10;

      if (isScrolledToBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  if (userData == null || !userConversations || !userChats || !userContacts || !userGroupChats || !lastMessages || !unreadMessages) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center backdrop-blur-md z-50">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-white font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {logoutPopup && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <LogoutPopup setlogoutPopup={setlogoutPopup} logout={logout} />
        </div>
      )}
      {profilePopup && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <ProfilePopup setprofilePopup={setprofilePopup} />
        </div>
      )}
      {contactsPopup && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <MyContacts setcontactsPopup={setcontactsPopup} setSelectedPhoneNo={setSelectedPhoneNo} isNewChat={isNewChat} setisNewChat={setisNewChat} />
        </div>
      )}
      {groupChatPopup && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <CreateGroup setgroupChatPopup={setgroupChatPopup} />
        </div>
      )}
      {contactInfoPopup && (
        <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center z-50'>
          <ContactInfo setcontactInfoPopup={setcontactInfoPopup} contact={contact} />
        </div>
      )}
      {groupInfoPopup && (
        <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center z-50'>
          <GroupInfo setgroupInfoPopup={setgroupInfoPopup} groupChat={groupChat} />
        </div>
      )}
      {newChatPopup && (
        <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center z-40'>
          <NewChatPopup setnewChatPopup={setnewChatPopup} setcontactsPopup={setcontactsPopup} selectedPhoneNo={selectedPhoneNo} setSelectedPhoneNo={setSelectedPhoneNo} setisNewChat={setisNewChat} />
        </div>
      )}
      {preview && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='file-box relative border py-6 md:px-6 px-6 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg lg:w-[20%] md:w-1/3 w-[80%] flex flex-col justify-center items-center'>
            <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setpreview(null)} />
            <div className='relative flex flex-col items-center justify-center py-8'>
              {isImage ? (
                <img src={preview} className="border rounded-lg w-32 h-32 object-cover" alt="" />
              ) : (
                <FontAwesomeIcon icon={faFile} className='text-8xl text-white' />
              )}
              <FontAwesomeIcon
                icon={faCircleMinus}
                className='absolute top-[20px] right-[-10px] text-red-500 text-xl cursor-pointer'
                onClick={() => setpreview(null)}
              />
              <span className='mt-4 text-white border px-3 py-1 rounded'>{attachment.name}</span>
            </div>
            <div className='absolute bottom-3 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-purple-600 cursor-pointer' onClick={() => sendFile(contact ? contact.conversationId : groupChat ? groupChat.conversationId : null)}>
              <FontAwesomeIcon
                icon={faPaperPlane}
                className='text-lightGray text-lg'
              />
            </div>
          </div>
        </div>
      )}

      <div className='container flex min-w-full min-h-screen'>
        <div className="left-panel flex flex-col w-full lg:w-[30%] h-[90vh] lg:h-[93vh] m-3 lg:m-5 lg:ml-4 lg:mr-2 rounded-2xl bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] shadow-sm shadow-lightGray">
          <div className="logo-profile flex items-center justify-between px-4 py-3">
            <div className='logo flex relative'>
              <h1 className='xl:text-3xl text-[26px] font-semibold'>BuzzTalk</h1>
              <FontAwesomeIcon icon={faMessage} className="xl:text-2xl text-xl absolute xl:left-32 left-[110px] xl:top-[6px] top-[9px]" />
            </div>
            <div>
              <div className="profile flex gap-3 items-center">
                {/* Group Chat Icon */}
                <div ref={groupChatRef} className="relative">
                  <img src="../../../icons/group.png" alt="" className='h-10 w-10 relative bottom-[2px] cursor-pointer invert' onClick={toggleGroupChatTooltip} />
                  {showGroupChatTooltip && (
                    <div className="absolute left-0 top-8 border p-2 text-sm bg-lightGray text-black rounded font-bold cursor-pointer z-50"
                      onClick={() => { setgroupChatPopup(true); setshowGroupChatTooltip(false); }}>
                      New Group
                    </div>
                  )}
                </div>

                {/* Profile Icon */}
                <div ref={profileRef} className="relative">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="border-2 rounded-full p-[5px] text-xs cursor-pointer hover:text-lightGray box-border"
                    onClick={toggleProfileTooltip}
                  />
                  {showProfileTooltip && (
                    <div className="absolute left-0 top-8 border p-2 text-sm bg-lightGray text-black rounded font-bold cursor-pointer z-50"
                      onClick={() => { setprofilePopup(true); setshowProfileTooltip(false); }}>
                      Profile Info
                    </div>
                  )}
                </div>

                {/* Contacts Icon */}
                <div ref={contactsRef} className="relative">
                  <FontAwesomeIcon
                    icon={faAddressBook}
                    className="p-[6px] text-xl cursor-pointer hover:text-lightGray"
                    onClick={toggleContactsTooltip}
                  />
                  {showContactsTooltip && (
                    <div className="absolute left-0 top-8 border p-2 text-sm bg-lightGray text-black rounded font-bold cursor-pointer z-50"
                      onClick={() => { setcontactsPopup(true); setshowContactsTooltip(false); }}>
                      My Contacts
                    </div>
                  )}
                </div>

                {/* Logout Icon */}
                <div ref={logoutRef} className="relative">
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="text-xl cursor-pointer hover:text-lightGray"
                    onClick={toggleLogoutTooltip}
                  />
                  {showLogoutTooltip && (
                    <div className="absolute lg:left-0 -left-8 top-8 border p-2 z-50 text-sm bg-lightGray text-black rounded font-bold cursor-pointer"
                      onClick={() => { setlogoutPopup(true); setshowLogoutTooltip(false); }}>
                      Logout
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='chat-list flex flex-col flex-grow bg-[#1A0F22] m-3 mt-4 rounded-2xl overflow-hidden'>
            {/* Search Bar For Chats */}
            <div className='search-bar flex relative'>
              <input type="text" placeholder='Search chats...' ref={inputRef} className='m-4 mb-1 rounded-2xl py-2 w-full px-4 text-sm text-black bg-lightGray placeholder-black' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <FontAwesomeIcon icon={faMagnifyingGlass} onClick={focusInput} className='absolute right-8 top-[26px] text-black cursor-pointer' />
            </div>

            {/* List of All Chats */}
            <div className='chats flex-grow overflow-y-auto space-y-2 p-4 xl:p-4 lg:p-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 relative right-2 ml-1'>
              {userChats.length === 0 ? (
                <p className="text-center text-gray-400 mt-10">No Chats Found</p>
              ) : (
                userChats.map((chat, index) => (
                  <div
                    key={index}
                    className="chat flex items-center justify-between py-2 px-3 xl:px-3 lg:px-2 bg-[#25162F] hover:bg-[#382041] transition rounded-lg cursor-pointer"
                    onClick={() => (chat.isGroup ? getGroupChat(chat.person_group) : getContactChat(chat.person_group))}
                  >
                    {/* Chat Image */}
                    <div className="flex items-center xl:gap-3 lg:gap-2 gap-3">
                      {chat.image === "" ? (
                        <FontAwesomeIcon
                          icon={chat.isGroup ? faUsers : faUser}
                          className="p-[14px] rounded-full cursor-pointer text-lg bg-lightGray text-[#1A0F22]"
                        />
                      ) : (
                        <img src={chat.image} alt="" className="w-11 h-11 rounded-full object-cover" />
                      )}
                      {/* Chat Info */}
                      <div className="w-48 xl:w-48 lg:w-32">
                        <p className="text-sm xl:text-sm lg:text-xs font-bold truncate">{chat.name_phoneNo}</p>
                        <div className={`text-xs xl:text-xs lg:text-[10px] truncate ${chat.unreadMessages > 0 ? "text-white" : "text-gray-400"}`}>
                          <span>{chat.lastMessageText}</span>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-center gap-y-1'>
                      <span className={`text-xs xl:text-xs lg:text-[10px] ${chat.unreadMessages > 0 ? "text-white" : "text-gray-400"}`}>
                        {chat.lastMessageTime
                          ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                          : ""}
                      </span>
                      {chat.unreadMessages > 0 ? (
                        <span className="bg-purple-600 text-white text-xs px-[3px] py-[1px] rounded-full min-w-[20px] text-center">
                          {chat.unreadMessages}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )
              }
            </div>

            {/* Add New Chat Button */}
            <div className='add-newChat sticky bottom-0 right-0 p-4 bg-[#1A0F22] flex justify-end'>
              <FontAwesomeIcon icon={faPlus} className='rounded-lg bg-purple-600 p-3 cursor-pointer' onClick={() => setnewChatPopup(true)} />
            </div>
          </div>
        </div>

        <div className={`right-panel max-h-full w-[95%] lg:w-[70%] md:w-[97.2%] rounded-2xl bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] shadow-sm shadow-lightGray flex flex-col fixed top-0 right-0 bottom-0 z-10 m-3 lg:m-5 lg:ml-2 lg:mr-4 transition-transform duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full'} lg:static lg:translate-x-0`}>
          <div>
            <FontAwesomeIcon icon={faArrowLeft} onClick={() => goBackToContacts()} className='lg:hidden cursor-pointer relative top-2 left-5 font-bold text-lg' />
          </div>
          <div className='name-box h-[10%] m-3 mb-1 rounded-2xl bg-[#1A0F22] flex items-center justify-between gap-x-3'>
            {contact && (
              <>
                <div className='flex items-center ml-1 gap-x-3 cursor-pointer' onClick={() => setcontactInfoPopup(true)}>
                  {contact.image ? (
                    <img src={contact.image} alt="" className='w-10 h-10 rounded-full object-cover ml-3' />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="p-3 rounded-full cursor-pointer text-lg bg-lightGray text-[#1A0F22] ml-3" />
                  )}
                  {!contact.notContact ? (
                    <div className='flex gap-x-1'>
                      <p className='font-bold text-sm'>{contact.firstName}</p>
                      <p className='font-bold text-sm'>{contact.lastName}</p>
                    </div>
                  ) : (
                    <div>
                      <p className='font-bold text-sm'>{contact.phoneNo}</p>
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-x-5 mr-7'>
                  <FontAwesomeIcon icon={faCircleInfo} className='cursor-pointer' onClick={() => setcontactInfoPopup(true)} />
                  <FontAwesomeIcon icon={faPhone} className='cursor-pointer' />
                  <FontAwesomeIcon icon={faVideo} className='cursor-pointer' />
                </div>
              </>
            )}
            {groupChat && (
              <>
                <div className='flex items-center ml-1 gap-x-3 cursor-pointer' onClick={() => setgroupInfoPopup(true)}>
                  {groupChat.image ? (
                    <img src={groupChat.image} alt="" className='w-10 h-10 rounded-full object-cover ml-3' />
                  ) : (
                    <FontAwesomeIcon icon={faUsers} className="p-3 rounded-full cursor-pointer text-lg bg-lightGray text-[#1A0F22] ml-3" />
                  )}
                  <div>
                    <p className='font-bold'>{groupChat.groupChatName}</p>
                  </div>
                </div>
                <div className='flex items-center gap-x-5 mr-7'>
                  <FontAwesomeIcon icon={faCircleInfo} className='cursor-pointer' onClick={() => setgroupInfoPopup(true)} />
                  <FontAwesomeIcon icon={faPhone} className='cursor-pointer' />
                  <FontAwesomeIcon icon={faVideo} className='cursor-pointer' />
                </div>
              </>
            )}
          </div>
          <div className='messages-box flex flex-col flex-grow h-0 min-h-0 mx-3 my-2 rounded-2xl bg-[#1A0F22] p-4 relative overflow-y-auto' ref={messagesContainerRef}>
            {(contact && !isAppLoading) && (
              <div className="flex-1 overflow-y-auto pr-2">
                {messages.map((msg, index) => (
                  <div key={index} className={`p-2 my-2 flex flex-col gap-y-1 rounded-lg xl:w-[40%] md:w-[46%] w-[70%] break-words overflow-hidden ${msg.senderId === userData._id ? 'bg-purple-600 text-white ml-auto' : 'bg-gray-700 text-white'}`}>
                    <p>
                      {!msg.fileUrl ? (
                        <span>{msg.text}</span>
                      ) : (
                        <span className='flex justify-between items-center'>
                          <span className='flex gap-x-2 items-center'>
                            {msg.fileType?.includes("image") ? (
                              <FontAwesomeIcon icon={faImage} />
                            ) : (
                              <FontAwesomeIcon icon={faFile} />
                            )}
                            {getFileName(msg.fileUrl)}
                          </span>
                          <span>
                            {downloadStatus[msg._id] === 'loading' ? (
                              <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                            ) : downloadStatus[msg._id] === 'success' ? (
                              <FontAwesomeIcon icon={faCheckCircle} className="text-lg text-green-400" />
                            ) : (
                              <FontAwesomeIcon
                                icon={faCircleDown}
                                className='text-lg cursor-pointer'
                                onClick={() => downloadFile(msg.fileUrl, getFileName(msg.fileUrl), msg._id)}
                              />
                            )}
                          </span>
                        </span>
                      )}
                    </p>
                    <div className='flex justify-end'>
                      <small className="text-gray-300 text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </small>
                    </div>
                  </div>
                ))}
                {/* Invisible div to keep the scroll at the bottom */}
                <div ref={messagesEndRef}></div>
              </div>
            )}

            {(groupChat && !isAppLoading) && (
              <div className="flex-1 overflow-y-auto pr-2">
                {messages.map((msg, index) => {
                  const senderContact = userContacts.find(contact => contact.contactId === msg.senderId);
                  const senderData = users.find(user => user._id.toString() === msg.senderId.toString());
                  return (
                    <div key={index} className={`p-2 my-2 rounded-lg xl:w-[40%] md:w-[46%] w-[70%] break-words overflow-hidden ${msg.senderId === userData._id ? 'bg-purple-600 text-white ml-auto' : 'bg-gray-700 text-white'}`}>
                      {msg.senderId !== userData._id && (
                        <small className="text-gray-300 font-bold">
                          {senderContact ? `${senderContact.firstName} ${senderContact.lastName}` : senderData?.phoneNo}
                        </small>
                      )}
                      <p>
                        {!msg.fileUrl ? (
                          <span>{msg.text}</span>
                        ) : (
                          <span className='flex justify-between items-center'>
                            <span className='flex gap-x-2 items-center'>
                              {msg.fileType?.includes("image") ? (
                                <FontAwesomeIcon icon={faImage} />
                              ) : (
                                <FontAwesomeIcon icon={faFile} />
                              )}
                              {getFileName(msg.fileUrl)}
                            </span>
                            <span>
                              {downloadStatus[msg._id] === 'loading' ? (
                                <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
                              ) : downloadStatus[msg._id] === 'success' ? (
                                <FontAwesomeIcon icon={faCheckCircle} className="text-lg text-green-400" />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faCircleDown}
                                  className='text-lg cursor-pointer'
                                  onClick={() => downloadFile(msg.fileUrl, getFileName(msg.fileUrl), msg._id)}
                                />
                              )}
                            </span>
                          </span>
                        )}
                      </p>
                      <div className='flex justify-end'>
                        <small className="text-gray-300">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </small>
                      </div>
                    </div>
                  )
                })}
                {/* Invisible div to keep the scroll at the bottom */}
                <div ref={messagesEndRef}></div>
              </div>
            )}

          </div>
          <div className="p-3 mx-3 mb-2 flex justify-between bg-[#1A0F22] sticky bottom-0 rounded-2xl">

            {/* Add Attachment Button */}
            <div
              ref={attachmentRef}
              className={`w-10 h-10 flex items-center justify-center rounded-lg mr-2 relative ${contact || groupChat ? "bg-purple-600 cursor-pointer" : "bg-gray-500 opacity-50"
                }`}
              onClick={contact || groupChat ? () => setshowAttachmentTooltip(true) : null}
            >
              <FontAwesomeIcon icon={faPaperclip} className='text-lightGray text-lg' />
              {showAttachmentTooltip && (
                <div className="absolute left-0 top-[-77px] border text-sm bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] text-white rounded font-bold w-32">
                  {/* for image files */}
                  <input onChange={handleFileChange} type="file" accept='image/*' id='image' hidden />
                  <label htmlFor='image' className='p-2 border-b cursor-pointer flex justify-between items-center'>
                    <span>Photos</span>
                    <FontAwesomeIcon icon={faImage} />
                  </label>
                  {/* for documents */}
                  <input onChange={handleFileChange} type="file" id="documents" hidden />
                  <label htmlFor='documents' className='p-2 cursor-pointer flex justify-between items-center'>
                    <span>Documents</span>
                    <FontAwesomeIcon icon={faFile} />
                  </label>
                </div>
              )}
            </div>

            {/* Input Message Box */}
            <input
              type="text"
              className={`flex-1 p-2 rounded-lg text-white text-sm ${contact || groupChat ? "bg-gray-800" : "bg-gray-500 opacity-50"
                }`}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setnewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (contact || groupChat)) {
                  sendMessage(contact ? contact.conversationId : groupChat ? groupChat.conversationId : null);
                }
              }}
              disabled={!contact && !groupChat}
            />

            {/* Send Message Button */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full ml-2 ${contact || groupChat ? "bg-purple-600 cursor-pointer" : "bg-gray-500 opacity-50"}`}
              onClick={() => sendMessage(contact ? contact.conversationId : groupChat ? groupChat.conversationId : null)}
            >
              <FontAwesomeIcon icon={faPaperPlane} className='text-lightGray text-lg' />
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default ChatPage
