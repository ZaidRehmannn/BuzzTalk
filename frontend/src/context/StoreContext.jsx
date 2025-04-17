import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { socket } from '../socket.js';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const url = 'http://localhost:4000';

    const [userData, setuserData] = useState(null);
    const [userContacts, setuserContacts] = useState([]);
    const [userGroupChats, setuserGroupChats] = useState([]);
    const [users, setusers] = useState([]);
    const [groupChatDetails, setgroupChatDetails] = useState([]);
    const [lastMessages, setlastMessages] = useState({});
    const [userConversations, setuserConversations] = useState([]);
    const [unreadMessages, setunreadMessages] = useState({});
    const [addContactPopup, setaddContactPopup] = useState(false);
    const [isAppLoading, setIsAppLoading] = useState(true);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/profile/info', {}, { headers: { token } });
        if (response.data.success) {
            setuserData(response.data.userData);
        } else {
            console.log(response.data.message);
        }
    };

    const fetchUserContacts = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.post(url + '/api/contacts/list', {}, { headers: { token } });
        if (response.data.success) {
            setuserContacts(response.data.contacts);
        } else {
            console.log(response.data.message);
        }
    };

    const fetchUserGroupChats = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.post(url + '/api/groupChat/list', {}, { headers: { token } });
        if (response.data.success) {
            setuserGroupChats(response.data.groupChats);
        } else {
            console.log(response.data.message);
        }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.post(url + '/api/user/getusers', {}, { headers: { token } });
        if (response.data.success) {
            setusers(response.data.users);
        } else {
            console.log(response.data.message);
        }
    };

    const fetchGroupChatDetails = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.post(url + '/api/groupChat/details', {}, { headers: { token } });
        if (response.data.success) {
            setgroupChatDetails(response.data.groupChatDetails);
        } else {
            console.log(response.data.message);
        }
    };

    const fetchLastMessages = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.post(url + '/api/conversation/getlastmsgs', {}, { headers: { token } });
        if (response.data.success) {
            setlastMessages(response.data.lastMessages);
        } else {
            console.log(response.data.message);
        }
    };

    const fetchUserConversations = async () => {
        const token = localStorage.getItem("token");
        const response = await axios.post(url + '/api/conversation/getuserconvos', {}, { headers: { token } });
        if (response.data.success) {
            setuserConversations(response.data.enhancedConversations);
        } else {
            console.log(response.data.message);
        }
    };

    const fetchAllUnreadMessages = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            const response = await axios.post(url + '/api/conversation/allunreadmsgs', {}, { headers: { token } });
            if (response.data.success) {
                setunreadMessages(response.data.unreadMessagesCount);
            }
        }
    };

    const resetStore = () => {
        setuserData(null);
        setuserContacts([]);
        setuserGroupChats([]);
        setusers([]);
        setgroupChatDetails([]);
        setlastMessages({});
        setuserConversations([]);
        setunreadMessages({});
        setaddContactPopup(false);
        setIsAppLoading(true);
    }

    const fetchAllData = async () => {
        const token = localStorage.getItem("token");

        if (token) {
            await Promise.all([
                fetchUserData(),
                fetchUserContacts(),
                fetchUserGroupChats(),
                fetchUsers(),
                fetchGroupChatDetails(),
                fetchLastMessages(),
                fetchUserConversations(),
                fetchAllUnreadMessages(),
            ]);
        }

        setIsAppLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (!isAppLoading) {
            const handleGroupChatAdded = (newGroup) => {
                setuserGroupChats((prevGroups) => [...prevGroups, newGroup]);
            };

            const handleContactAdded = (newContact) => {
                setuserContacts((prevContacts) => [...prevContacts, newContact]);
            };

            socket.on("groupChatAdded", handleGroupChatAdded);
            socket.on("contactAdded", handleContactAdded);

            return () => {
                socket.off("groupChatAdded", handleGroupChatAdded);
                socket.off("contactAdded", handleContactAdded);
            };
        }
    }, [isAppLoading]);

    const contextValue = {
        url,
        userData,
        fetchUserData,
        fetchUserContacts,
        userContacts,
        userGroupChats,
        fetchUserGroupChats,
        users,
        fetchGroupChatDetails,
        groupChatDetails,
        fetchLastMessages,
        lastMessages,
        setlastMessages,
        userConversations,
        fetchUserConversations,
        unreadMessages,
        setunreadMessages,
        fetchAllUnreadMessages,
        addContactPopup,
        setaddContactPopup,
        isAppLoading,
        resetStore
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
