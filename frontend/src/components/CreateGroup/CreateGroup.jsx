import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faUserPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const CreateGroup = ({ setgroupChatPopup }) => {
    const { url, userContacts } = useContext(StoreContext);
    const [formData, setformData] = useState({
        groupName: "",
        members: []
    });
    const [successMessage, setsuccessMessage] = useState("");
    const [errorMessage, seterrorMessage] = useState("");
    const [contactsListPopup, setcontactsListPopup] = useState(false);
    const [members, setmembers] = useState([]);

    useEffect(() => {
        setformData((prevData) => ({
            ...prevData,
            members: members
        }));
    }, [members]);

    const handleChange = (e) => {
        setformData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setsuccessMessage("");
        seterrorMessage("");

        if (members.length < 2) {
            seterrorMessage("A group must have at least 2 members.");
            return;
        }

        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/groupChat/create', formData, { headers: { token } });

        if (response.data.success) {
            setformData({ groupName: "", members: [] });
            setmembers([]);
            setsuccessMessage(response.data.message);
        } else {
            seterrorMessage(response.data.message);
        }
    };

    const addMembers = (contact) => {
        if (!members.includes(contact)) {
            setmembers((prevMembers) => [...prevMembers, contact]);
        }
        setcontactsListPopup(false);
    };

    const removeMembers = (member) => {
        const updated_members = members.filter(m => m !== member);
        setmembers(updated_members);
    };

    return (
        <div className="relative w-full flex justify-center items-center">
            {/* Contact List Popup */}
            {contactsListPopup && (
                <div className='absolute top-full left-1/2 -translate-x-1/2 -translate-y-full z-50 border pt-8 pb-6 md:px-8 px-7 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg xl:w-1/4 lg:w-1/3 md:w-2/5 w-3/4'>
                    <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setcontactsListPopup(false)} />
                    <div className='my-contacts'>
                        <h1 className='text-xl font-semibold text-lightGray'>My Contacts</h1>
                        <div className='contacts-list bg-[#1A0F22] h-72 rounded-lg my-3 overflow-y-auto'>
                            {userContacts && userContacts.length > 0 ? (
                                userContacts.map((contact, index) => (
                                    <div key={index} className='contact-item p-3 border-b border-gray-600 text-lightGray hover:bg-[#241828] flex gap-x-1 items-center cursor-pointer' onClick={() => addMembers(contact)}>
                                        <p className='text-sm font-semibold'>{contact.firstName}</p>
                                        <p className='text-sm font-semibold'>{contact.lastName}</p>
                                    </div>
                                ))
                            ) : (
                                <div className='flex justify-center items-center h-full'>
                                    <p className='text-sm text-gray-400'>No contacts found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Group Box */}
            <div className='newgroup-box border p-6 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg relative xl:w-1/3 lg:w-2/5 md:w-1/2 w-4/5 z-40'>
                <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setgroupChatPopup(false)} />
                <h1>Create New Group</h1>
                <form className='group-details flex flex-col mt-3 mb-1 gap-y-4' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="groupName" className='text-lightGray text-sm'>Group Name:</label>
                        <input type="text" id='groupName' placeholder='Enter Group Name' className='rounded py-1 px-2 text-sm bg-[#1A0F22] w-full' value={formData.groupName} onChange={handleChange} required />
                    </div>
                    <div className='members-list relative flex flex-col gap-y-2'>
                        <h2 className='text-lightGray text-sm'>Add Members:</h2>
                        <div className='list max-h-32 overflow-y-auto flex flex-col gap-y-2'>
                            {members && (
                                members.map((member, index) => (
                                    <span className='rounded py-2 px-2 text-sm bg-[#1A0F22] w-[98%] flex justify-between items-center' key={index}>
                                        <span className='flex gap-x-1'>
                                            <p>{member.firstName}</p>
                                            <p>{member.lastName}</p>
                                        </span>
                                        <FontAwesomeIcon className='text-sm cursor-pointer text-red-700' icon={faTrash} onClick={() => removeMembers(member)} />
                                    </span>
                                ))
                            )}
                        </div>
                        <div className="mt-1 flex justify-start">
                            <FontAwesomeIcon icon={faUserPlus} className='p-2 text-sm border rounded-md bg-purple-900 shadow-sm cursor-pointer hover:text-lightGray hover:border-lightGray' onClick={() => setcontactsListPopup(true)} />
                        </div>
                    </div>
                    {successMessage && (
                        <div className='text-sm text-green-500 font-bold mt-1'>{successMessage}</div>
                    )}
                    {errorMessage && (
                        <div className='text-sm text-red-500 font-bold mt-1'>{errorMessage}</div>
                    )}
                    <div>
                        <button type='submit' className='text-sm border py-1 mt-1 px-2 rounded-md bg-purple-900 hover:text-lightGray hover:border-lightGray'>Create Group</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;
