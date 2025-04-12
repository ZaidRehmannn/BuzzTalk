import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const AddContact = ({ phoneNo }) => {
    const { url, setaddContactPopup } = useContext(StoreContext);
    const [formData, setformData] = useState({
        firstName: "",
        lastName: "",
        phoneNo: phoneNo || ""
    });
    const [successMessage, setsuccessMessage] = useState("");
    const [errorMessage, seterrorMessage] = useState("");

    const handleChange = (e) => {
        setformData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        setsuccessMessage("");
        seterrorMessage("");
        e.preventDefault();
        const token = localStorage.getItem('token');
        const response = await axios.post(url + '/api/contacts/add', formData, { headers: { token } });
        if (response.data.success) {
            setformData({
                firstName: "",
                lastName: "",
                phoneNo: ""
            });
            setsuccessMessage(response.data.message);
        }
        else {
            seterrorMessage(response.data.message);
        }
    };

    return (
        <div className='addcontact-box border p-6 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg relative xl:w-1/5 lg:w-1/3 md:w-2/5 w-4/6'>
            <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setaddContactPopup(false)} />
            <h1>Create New Contact</h1>
            <form className='contact-details flex flex-col mt-3 mb-1 gap-y-2' onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName" className='text-lightGray text-sm'>First Name:</label>
                    <input type="text" id='firstName' placeholder='Enter First Name' className='rounded py-1 px-2 text-sm bg-[#1A0F22] w-full' value={formData.firstName} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="lastName" className='text-lightGray text-sm'>Last Name:</label>
                    <input type="text" id='lastName' placeholder='Enter Last Name' className='rounded py-1 px-2 text-sm bg-[#1A0F22] w-full' value={formData.lastName} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="phoneNo" className='text-lightGray text-sm'>Phone Number:</label>
                    <input type="text" id='phoneNo' placeholder='Enter Phone Number' className='rounded py-1 px-2 text-sm bg-[#1A0F22] w-full' value={formData.phoneNo} onChange={handleChange} required />
                </div>
                {successMessage && (
                    <div className='text-sm text-green-500 font-bold mt-1'>{successMessage}</div>
                )}
                {errorMessage && (
                    <div className='text-sm text-red-500 font-bold mt-1'>{errorMessage}</div>
                )}
                <div>
                    <button type='submit' className='text-sm border py-1 px-2 mt-1 rounded-md bg-purple-900 hover:text-lightGray hover:border-lightGray'>Add Contact</button>
                </div>
            </form>
        </div>
    )
}

export default AddContact
