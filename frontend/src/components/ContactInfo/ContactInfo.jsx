import React, { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faUser } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import AddContact from '../AddContact/AddContact';

const ContactInfo = ({ setcontactInfoPopup, contact }) => {
    const { addContactPopup, setaddContactPopup } = useContext(StoreContext);
    return (
        <>
            {addContactPopup && (
                <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center z-50'>
                    <AddContact phoneNo={contact.phoneNo} />
                </div>
            )}
            <div className='contactinfo-box border p-6 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg relative xl:w-1/5 lg:w-3/12 md:w-2/6 w-[67%]'>
                <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setcontactInfoPopup(false)} />
                <div className='contact-image flex justify-center items-center my-3'>
                    {contact.image ? (
                        <img src={contact.image} className='border rounded-full w-24 h-24 object-cover' alt="" />
                    ) : (
                        <FontAwesomeIcon icon={faUser} className="border p-6 rounded-full cursor-pointer text-5xl bg-lightGray text-[#1A0F22]" />
                    )
                    }
                </div>
                {!contact.notContact ? (
                    <div className='contact-details text-sm flex flex-col gap-y-1'>
                        <p>First Name: {contact.firstName}</p>
                        <p>Last Name: {contact.lastName}</p>
                        <p>Phone Number: {contact.phoneNo}</p>
                    </div>
                ) : (
                    <div className='person-details text-sm flex flex-col gap-y-1'>
                        <p>Phone Number: {contact.phoneNo}</p>
                        <button className='text-sm border py-1 px-2 mt-1 rounded-md bg-purple-900 hover:text-lightGray hover:border-lightGray' onClick={() => setaddContactPopup(true)}>Add to Contacts</button>
                    </div>
                )}
            </div>
        </>
    )
};
export default ContactInfo
