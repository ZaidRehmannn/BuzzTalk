import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faUsers, faCheck, faTrash, faPenToSquare, faSquarePlus, faSquareMinus } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const GroupInfo = ({ setgroupInfoPopup, groupChat }) => {
    const [image, setimage] = useState(null);
    const [preview, setpreview] = useState(null);
    const [editName, seteditName] = useState(false);
    const [tempName, settempName] = useState('');
    const [contactsListPopup, setcontactsListPopup] = useState(false);
    const [adminsListPopup, setadminsListPopup] = useState(false);
    const [membersListPopup, setmembersListPopup] = useState(false);
    const [leaveGroupPopup, setleaveGroupPopup] = useState(false);
    const [newAdminPopup, setnewAdminPopup] = useState(false);
    const [adminNames, setadminNames] = useState([]);
    const [memberNames, setmemberNames] = useState([]);
    const [changeadmins, setchangeadmins] = useState(false);
    const [changemembers, setchangemembers] = useState(false);
    const [addRemove, setaddRemove] = useState(null);
    const { groupChatDetails, users, userData, url, fetchGroupChatDetails, userContacts, fetchUserGroupChats } = useContext(StoreContext);
    const group = groupChatDetails.find(gc => gc._id === groupChat.groupChatId);

    useEffect(() => {
        if (!group || !users) return;

        const admins = group.admins
            .map(adminId => {
                const admin = users.find(user => user._id === adminId);
                if (!admin) return null; // Prevents undefined error
                if (!isContact(admin._id)) {
                    return {
                        id: admin._id,
                        name: admin._id === userData._id ? "You" : admin.phoneNo
                    };
                } else {
                    return {
                        id: admin._id,
                        name: `${admin.firstName} ${admin.lastName}`
                    };
                }
            })
            .filter(admin => admin !== null); // Removes null values

        const members = group.participants
            .map(participantId => {
                const member = users.find(user => user._id === participantId);
                if (!member) return null; // Prevents undefined error
                if (!isContact(member._id)) {
                    return {
                        id: member._id,
                        name: member._id === userData._id ? "You" : member.phoneNo
                    };
                } else {
                    return {
                        id: member._id,
                        name: `${member.firstName} ${member.lastName}`
                    };
                }
            })
            .filter(member => member !== null); // Removes null values

        setadminNames(admins);
        setmemberNames(members);
    }, [groupChatDetails, groupChat, users, userContacts]);

    const changeGroupPicture = async () => {
        const formData = new FormData();
        formData.append('groupChatId', groupChat.groupChatId);
        formData.append('image', image);
        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/groupChat/addimage', formData, { headers: { token, 'Content-Type': 'multipart/form-data' } });
        if (response.data.success) {
            fetchGroupChatDetails();
            setpreview(null);
            setimage(null);
        }
    };

    const removeGroupPicture = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/groupChat/removeimage', { groupChatId: groupChat.groupChatId }, { headers: { token } });
        if (response.data.success) {
            fetchGroupChatDetails();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setimage(file);
            const reader = new FileReader();
            reader.onload = () => {
                setpreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveNameChange = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/groupChat/updateinfo', { groupChatId: groupChat.groupChatId, groupName: tempName }, { headers: { token } });
        if (response.data.success) {
            fetchGroupChatDetails();
            seteditName(false);
        }
    };

    const addAdminsMembers = async (contact, changeadmins, changemembers) => {
        const token = localStorage.getItem('token');
        if (changeadmins) {
            if (!group.admins.includes(contact)) {
                const response = await axios.post(url + '/api/groupChat/updateinfo', { groupChatId: groupChat.groupChatId, newAdmin: contact }, { headers: { token } });
                if (response.data.success) {
                    fetchGroupChatDetails();
                    setcontactsListPopup(false);
                }
            }
            setchangeadmins(false);
            setaddRemove(null);
        }
        if (changemembers) {
            if (!group.participants.includes(contact.contactId)) {
                const response = await axios.post(url + '/api/groupChat/updateinfo', { groupChatId: groupChat.groupChatId, newMember: contact.contactId }, { headers: { token } });
                if (response.data.success) {
                    fetchGroupChatDetails();
                    setcontactsListPopup(false);
                }
            }
            setchangemembers(false);
        }
    };

    const removeAdminsMembers = async (contactId, changeadmins, changemembers) => {
        if (contactId === userData._id) {
            return
        } else {
            const token = localStorage.getItem('token');
            if (changeadmins) {
                const response = await axios.post(url + '/api/groupChat/removemembers', { groupChatId: groupChat.groupChatId, removeAdmin: contactId }, { headers: { token } });
                if (response.data.success) {
                    fetchGroupChatDetails();
                    setadminsListPopup(false);
                }
                setchangeadmins(false);
            }
            if (changemembers) {
                let response;
                if (isAdmin(contactId)) {
                    response = await axios.post(url + '/api/groupChat/removemembers', { groupChatId: groupChat.groupChatId, removeAdmin: contactId, removeMember: contactId }, { headers: { token } });
                }
                else {
                    response = await axios.post(url + '/api/groupChat/removemembers', { groupChatId: groupChat.groupChatId, removeMember: contactId }, { headers: { token } });
                }
                if (response.data.success) {
                    removeGroupChat(contactId, groupChat.groupChatId);
                    fetchGroupChatDetails();
                    setmembersListPopup(false);
                }
                setchangemembers(false);
                setaddRemove(null);
            }
        }
    };

    const removeGroupChat = async (userId, groupChatId) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/groupChat/removegroup', { userId: userId, groupChatId: groupChatId }, { headers: { token } });
        if (response.data.success) {
            fetchUserGroupChats();
        }
    };

    const isAdmin = (userId) => {
        return group.admins.some(adminId => adminId === userId);
    };

    const isContact = (memberId) => {
        return userContacts.some(contact => contact.contactId === memberId.toString());
    };

    const leaveGroup = async () => {
        const token = localStorage.getItem('token');
        let response;
        if (isAdmin(userData._id)) {
            if (adminNames.length > 1 && memberNames.length > 1) {
                response = await axios.post(url + '/api/groupChat/removemembers', { groupChatId: groupChat.groupChatId, removeAdmin: userData._id, removeMember: userData._id }, { headers: { token } });
            }
            else if (adminNames.length == 1 && memberNames.length == 1) {
                response = await axios.post(url + '/api/groupChat/removemembers', { groupChatId: groupChat.groupChatId, removeAdmin: userData._id, removeMember: userData._id }, { headers: { token } });
            }
            else {
                setnewAdminPopup(true);
                return;
            }
        }
        else {
            response = await axios.post(url + '/api/groupChat/removemembers', { groupChatId: groupChat.groupChatId, removeMember: userData._id }, { headers: { token } });
        }
        if (response.data.success) {
            removeGroupChat(userData._id, groupChat.groupChatId);
            setgroupInfoPopup(false);
        }
    };

    const handleNewAdminSelection = async (newAdminId) => { 
        await addAdminsMembers(newAdminId, true, false);
        await leaveGroup();
        setnewAdminPopup(false);
    };

    return (
        <>
            {contactsListPopup && (
                <div className='contactsList-box border pt-8 pb-6 md:px-8 px-7 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg xl:w-1/4 lg:w-1/3 md:w-2/5 w-3/4 absolute flex justify-center items-center z-50'>
                    <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setcontactsListPopup(false)} />
                    <div className='my-contacts w-full'>
                        <h1 className='text-xl font-semibold text-lightGray'>My Contacts</h1>
                        <div className='contacts-list bg-[#1A0F22] h-72 rounded-lg my-3'>
                            {userContacts && userContacts.length > 0 ? (
                                userContacts.map((contact, index) => (
                                    <div key={index} className='contact-item p-3 border-b border-gray-600 text-lightGray hover:bg-[#241828] flex gap-x-1 items-center cursor-pointer' onClick={() => addAdminsMembers(contact, changeadmins, changemembers)}>
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

            {adminsListPopup && (
                <div className='adminsList-box border pt-8 pb-6 md:px-8 px-7 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg xl:w-1/4 lg:w-1/3 md:w-2/5 w-3/4 absolute flex justify-center items-center z-50'>
                    <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setadminsListPopup(false)} />
                    <div className='admins w-full'>
                        <h1 className='text-xl font-semibold text-lightGray'>Admins</h1>
                        <div className='admins-list bg-[#1A0F22] h-72 rounded-lg my-3'>
                            {adminNames && adminNames.map((admin, index) => (
                                <div key={index} className='contact-item p-3 border-b border-gray-600 text-lightGray hover:bg-[#241828] flex gap-x-1 items-center cursor-pointer' onClick={() => removeAdminsMembers(admin.id, changeadmins, changemembers)}>
                                    <p className='text-sm font-semibold'>{admin.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {membersListPopup && (
                <div className='membersList-box border pt-8 pb-6 md:px-8 px-7 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg xl:w-1/4 lg:w-1/3 md:w-2/5 w-3/4 absolute flex justify-center items-center z-50'>
                    <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setmembersListPopup(false)} />
                    <div className='members w-full'>
                        <h1 className='text-xl font-semibold text-lightGray'>Group Members</h1>
                        <div className='members-list bg-[#1A0F22] h-72 rounded-lg my-3'>
                            {memberNames && memberNames.map((member, index) => (
                                <div
                                    className='contact-item p-3 border-b border-gray-600 text-lightGray hover:bg-[#241828] flex gap-x-1 items-center cursor-pointer'
                                    onClick={() => ({
                                        add: () => addAdminsMembers(member.id, changeadmins, changemembers),
                                        remove: () => removeAdminsMembers(member.id, changeadmins, changemembers)
                                    }[addRemove]())}
                                    key={index}
                                >
                                    <p className='text-sm font-semibold'>{member.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {newAdminPopup && (
                <div className='newAdminList-box border pt-8 pb-6 md:px-8 px-7 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg xl:w-1/4 lg:w-1/3 md:w-2/5 w-3/4 absolute flex justify-center items-center z-50'>
                    <div className='members w-full'>
                        <h1 className='text-xl font-semibold text-lightGray'>Select New Admin:</h1>
                        <div className='members-list bg-[#1A0F22] h-72 rounded-lg my-3'>
                            {memberNames && memberNames.map((member, index) =>
                                member.id !== userData._id && (
                                    <div
                                        className='contact-item p-3 border-b border-gray-600 text-lightGray hover:bg-[#241828] flex gap-x-1 items-center cursor-pointer'
                                        onClick={() => {
                                            handleNewAdminSelection(member.id)
                                        }}
                                        key={index}
                                    >
                                        <p className='text-sm font-semibold'>{member.name}</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {leaveGroupPopup && (
                <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-40'>
                    <div className='popup-box flex flex-col border rounded py-5 px-12 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] gap-y-3'>
                        <h1 className='text-lightGray font-semibold text-2xl'>Leave Group Confirmation</h1>
                        <p className='text-sm'>Are you sure you want to leave the group?</p>
                        <div className='buttons flex gap-x-3 w-full'>
                            <button className='px-3 py-1 w-1/2 bg-lightPurple rounded' onClick={() => leaveGroup()}>Yes</button>
                            <button className='px-3 py-1 w-1/2 bg-gray-400 rounded' onClick={() => setleaveGroupPopup(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='info-box border py-6 md:px-10 px-6 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg relative xl:w-1/3 lg:w-1/2 md:w-2/3 w-[85%]'>
                <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setgroupInfoPopup(false)} />
                <div className='group-image flex justify-center items-center my-1'>
                    {preview ? (
                        <div className='flex flex-col gap-y-7 justify-center items-center'>
                            <img src={preview} className="border rounded-full w-32 h-32 object-cover" alt="" />
                            <div className='buttons flex justify-center items-center gap-x-4'>
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    className='rounded px-10 py-2 bg-green-600 cursor-pointer'
                                    onClick={changeGroupPicture}
                                />
                                <FontAwesomeIcon
                                    icon={faX}
                                    className='rounded px-10 py-2 bg-red-600 cursor-pointer'
                                    onClick={() => setpreview(null)}
                                />
                            </div>
                        </div>
                    ) : group.groupImage ? (
                        <div className='flex flex-col gap-y-7 justify-center items-center'>
                            <img src={group.groupImage} className="border rounded-full w-32 h-32 object-cover" alt="" />
                            {isAdmin(userData._id) && (
                                <>
                                    <input onChange={handleImageChange} type="file" accept='image/*' id='image' hidden />
                                    <div className='flex gap-x-2 items-center'>
                                        <label htmlFor='image' className='py-1 px-3 ml-4 rounded-lg bg-lightGray text-[#1A0F22] font-bold cursor-pointer'>
                                            Change Group Picture
                                        </label>
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className='text-lg cursor-pointer text-lightGray'
                                            onClick={removeGroupPicture}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className='flex flex-col justify-center items-center gap-y-7'>
                            <FontAwesomeIcon icon={faUsers} className="border p-8 rounded-full cursor-pointer text-6xl bg-lightGray text-[#1A0F22]" />
                            {isAdmin(userData._id) && (
                                <>
                                    <input onChange={handleImageChange} type="file" accept='image/*' id='image' hidden />
                                    <label htmlFor='image' className='py-1 px-3 rounded-lg bg-lightGray text-[#1A0F22] font-bold cursor-pointer'>
                                        Change Group Picture
                                    </label>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className='groupChat-details flex flex-col gap-y-3 mt-6'>
                    {editName ? (
                        <div className='flex items-center gap-x-3'>
                            <p><strong>Group Name: </strong></p>
                            <input type='text' value={tempName} onChange={(e) => settempName(e.target.value)} className='bg-lightGray text-[#1A0F22] px-2 py-1 rounded-md text-sm' />
                            <FontAwesomeIcon icon={faCheck} className='cursor-pointer text-green-500' onClick={() => saveNameChange()} />
                            <FontAwesomeIcon icon={faX} className='cursor-pointer text-red-500' onClick={() => seteditName(false)} />
                        </div>
                    ) : (
                        <div className='flex justify-between items-center'>
                            <p><strong>Group Name:</strong> {group.groupName}</p>
                            {isAdmin(userData._id) && (
                                <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer text-lightGray' onClick={() => {
                                    seteditName(true)
                                    settempName(group.groupName)
                                }} />
                            )}
                        </div>
                    )}
                    <div className='flex flex-col gap-y-1'>
                        <div className='flex justify-between'>
                            <strong className='pr-6'>Admins:</strong>
                            {isAdmin(userData._id) && (
                                <div className='flex justify-center items-center gap-x-3'>
                                    <FontAwesomeIcon
                                        icon={faSquarePlus}
                                        className="cursor-pointer text-green-500"
                                        onClick={() => {
                                            setmembersListPopup(true);
                                            setchangeadmins(true);
                                            setaddRemove("add");
                                        }}
                                    />
                                    <FontAwesomeIcon
                                        icon={faSquareMinus}
                                        className="cursor-pointer text-red-500"
                                        onClick={() => {
                                            setadminsListPopup(true);
                                            setchangeadmins(true);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className='bg-[#1A0F22] rounded-lg max-h-28 lg:max-h-[88px]'>
                            <ul className='w-full max-h-[105px] lg:max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-[#1A0F22] relative right-[6px] top-[2px] pl-[8px]'>
                                {adminNames.map((admin, index) => (
                                    <li className='p-2 text-sm border-b border-gray-600 text-lightGray' key={index}>
                                        {admin.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                    <div className='flex flex-col gap-y-1'>
                        <div className='flex justify-between'>
                            <strong className='pr-6'>Group Members:</strong>
                            {isAdmin(userData._id) && (
                                <div className='flex justify-center items-center gap-x-3'>
                                    <FontAwesomeIcon
                                        icon={faSquarePlus}
                                        className="cursor-pointer text-green-500"
                                        onClick={() => {
                                            setcontactsListPopup(true);
                                            setchangemembers(true);
                                        }}
                                    />
                                    <FontAwesomeIcon
                                        icon={faSquareMinus}
                                        className="cursor-pointer text-red-500"
                                        onClick={() => {
                                            setmembersListPopup(true);
                                            setchangemembers(true);
                                            setaddRemove("remove");
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className='bg-[#1A0F22] rounded-lg max-h-28 lg:max-h-[88px]'>
                            <ul className='w-full max-h-[105px] lg:max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-[#1A0F22] relative right-[6px] top-[2px] pl-[8px]'>
                                {memberNames && memberNames.map((member, index) => {
                                    return <li className='p-2 text-sm border-b border-gray-600 text-lightGray rounded-lg' key={index}>{member.name}</li>
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className='leave-group-btn'>
                        <button className='rounded-lg bg-red-500 px-3 py-1' onClick={() => setleaveGroupPopup(true)}>Leave Group</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GroupInfo;
