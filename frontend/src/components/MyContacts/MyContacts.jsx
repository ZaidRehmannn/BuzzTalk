import { React, useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faUserPlus, faCircleInfo, faTrash, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import AddContact from '../AddContact/AddContact';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import ContactInfo from '../ContactInfo/ContactInfo';

const MyContacts = ({ setcontactsPopup, setSelectedPhoneNo, isNewChat, setisNewChat }) => {
    const [contactInfoPopup, setcontactInfoPopup] = useState(false);
    const [contact, setcontact] = useState({});
    const { url, userContacts, fetchUserContacts, setaddContactPopup, addContactPopup } = useContext(StoreContext);

    const removeContact = async (phoneNo) => {
        const token = localStorage.getItem("token");
        const response = await axios.post(url + '/api/contacts/remove', { phoneNo }, { headers: { token } });
        if (response.data.success) {
            fetchUserContacts();
        }
    };

    return (
        <>
            {addContactPopup && (
                <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center z-50'>
                    <AddContact />
                </div>
            )}
            {contactInfoPopup && (
                <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center z-50'>
                    <ContactInfo setcontactInfoPopup={setcontactInfoPopup} contact={contact} />
                </div>
            )}
            <div className='contacts-box border pt-8 pb-12 md:px-8 px-7 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg relative xl:w-1/3 lg:w-1/2 md:w-3/5 w-4/5'>
                <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setcontactsPopup(false)} />
                <div className='my-contacts'>
                    <h1 className='text-xl font-semibold text-lightGray'>My Contacts</h1>
                    <div className='contacts-list bg-[#1A0F22] h-72 rounded-lg my-3'>
                        {userContacts && userContacts.length > 0 ? (
                            userContacts.map((contact, index) => (
                                <div
                                    key={index}
                                    className='contact-item p-3 border-b border-gray-600 text-lightGray hover:bg-[#241828] flex justify-between items-center cursor-pointer'
                                    onClick={() => {
                                        if (isNewChat) {
                                            setSelectedPhoneNo(contact.phoneNo);
                                            setcontactsPopup(false);
                                            setisNewChat(false);
                                        }
                                    }}
                                >
                                    <div className='flex gap-x-1'>
                                        <p className='text-sm font-semibold'>{contact.firstName}</p>
                                        <p className='text-sm font-semibold'>{contact.lastName}</p>
                                    </div>
                                    {!isNewChat && (
                                        <div className='flex gap-x-3'>
                                            <FontAwesomeIcon
                                                className='text-sm cursor-pointer'
                                                icon={faCircleInfo}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setcontactInfoPopup(true);
                                                    setcontact(contact);
                                                }}
                                            />
                                            <FontAwesomeIcon
                                                className='text-sm cursor-pointer text-red-700'
                                                icon={faTrash}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeContact(contact.phoneNo);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className='flex justify-center items-center h-full'>
                                <p className='text-sm text-gray-400'>No contacts found.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className='add-contacts absolute right-9 flex gap-x-2'>
                    <FontAwesomeIcon icon={faArrowsRotate} className='py-2 px-[10px] border rounded-md bg-purple-900 shadow-sm cursor-pointer hover:text-lightGray hover:border-lightGray' onClick={() => fetchUserContacts()} />
                    <FontAwesomeIcon icon={faUserPlus} className='p-2 border rounded-md bg-purple-900 shadow-sm cursor-pointer hover:text-lightGray hover:border-lightGray' onClick={() => setaddContactPopup(true)} />
                </div>
            </div>
        </>
    )
}

export default MyContacts
