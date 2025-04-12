import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faAddressBook } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const NewChatPopup = ({ setnewChatPopup, setcontactsPopup, selectedPhoneNo, setSelectedPhoneNo, setisNewChat }) => {
    const { url, fetchUserConversations } = useContext(StoreContext);
    const [successMessage, setsuccessMessage] = useState("");
    const [errorMessage, seterrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setsuccessMessage("");
        seterrorMessage("");

        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/conversation/createconvo', { phoneNo: selectedPhoneNo }, { headers: { token } });
        if (response.data.success) {
            setSelectedPhoneNo("");
            setsuccessMessage(response.data.message);
            fetchUserConversations();
        }
        else {
            seterrorMessage(response.data.message);
        }
    };

    return (
        <div className='createChat-box border p-6 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg relative xl:w-1/5 lg:w-1/3 md:w-2/5 w-4/6'>
            <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setnewChatPopup(false)} />
            <h1 className='mb-3'>Create New Chat</h1>
            <form className='flex flex-col gap-y-4' onSubmit={handleSubmit}>
                <div className='flex flex-col gap-y-1'>
                    <label htmlFor="phoneNo" className='text-lightGray text-sm'>Phone Number:</label>
                    <input type="text" id='phoneNo' placeholder='Enter Phone Number' className='rounded py-1 px-2 text-sm bg-[#1A0F22] w-full' value={selectedPhoneNo} onChange={(e) => setSelectedPhoneNo(e.target.value)} required />
                </div>
                {successMessage && (
                    <div className='text-sm text-green-500 font-bold mt-1'>{successMessage}</div>
                )}
                {errorMessage && (
                    <div className='text-sm text-red-500 font-bold mt-1'>{errorMessage}</div>
                )}
                <div className='flex justify-between items-center'>
                    <button type='submit' className='text-sm border p-2 mt-1 rounded-md bg-purple-900 hover:text-lightGray hover:border-lightGray'>Create Chat</button>
                    <FontAwesomeIcon icon={faAddressBook} className='border p-2 mt-1 rounded-md bg-purple-900 cursor-pointer hover:text-lightGray hover:border-lightGray' onClick={() => {
                        setisNewChat(true)
                        setcontactsPopup(true)
                    }} />
                </div>
            </form>
        </div>
    )
}

export default NewChatPopup
