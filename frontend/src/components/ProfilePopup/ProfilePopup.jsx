import { React, useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faUser, faCheck, faTrash, faPenToSquare, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ProfilePopup = ({ setprofilePopup }) => {
  const [image, setimage] = useState(null);
  const [preview, setpreview] = useState(null);
  const [editingField, seteditingField] = useState(null);
  const [tempName, settempName] = useState('');
  const { userData, url, fetchUserData } = useContext(StoreContext);
  const [passwordField, setpasswordField] = useState(false);
  const [passwordMessage, setpasswordMessage] = useState("");
  const [passwordVisibility, setpasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });
  const [passwords, setpasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const changeProfilePicture = async () => {
    const formData = new FormData();
    formData.append('image', image);
    const token = localStorage.getItem('token');
    const response = await axios.post(url + '/api/profile/addimage', formData, { headers: { token, 'Content-Type': 'multipart/form-data' } });
    if (response.data.success) {
      fetchUserData();
      setpreview(null);
      setimage(null);
    }
  };

  const removeProfilePicture = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post(url + '/api/profile/removeimage', {}, { headers: { token } });
    if (response.data.success) {
      fetchUserData();
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

  const saveNameChange = async (field) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(url + '/api/profile/updateinfo', { [field]: tempName }, { headers: { token } });
    if (response.data.success) {
      fetchUserData();
      seteditingField(null);
    }
  };

  const togglePasswordVisibility = (field) => {
    setpasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = (field, value) => {
    setpasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const savePassword = async () => {
    setpasswordMessage("");

    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmNewPassword) {
      setpasswordMessage("All fields are required!");
      return
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setpasswordMessage("Passwords do not match!");
      return
    }

    const token = localStorage.getItem("token");
    const response = await axios.post(url + '/api/profile/updatepassword', { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword }, { headers: { token } });
    if (response.data.success) {
      setpasswords({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setpasswordField(false);
    }
    else {
      setpasswordMessage(response.data.message);
    }
  };

  useEffect(() => {
    if (!userData) {
      fetchUserData();
    }
  }, []);

  if (!userData || !userData.firstName) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center backdrop-blur-md z-50">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-white font-semibold">Loading Profile...</div>
      </div>
    );
  } else {
    return (
      <div className='info-box border py-6 md:px-10 px-6 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] rounded-lg relative xl:w-1/3 lg:w-1/2 md:w-2/3 w-[85%]'>
        <FontAwesomeIcon icon={faX} className='absolute right-3 top-3 text-sm cursor-pointer' onClick={() => setprofilePopup(false)} />
        <div className='profile-image flex flex-col justify-center items-center gap-y-5 py-6'>
          {preview ? (
            <div className='flex flex-col gap-y-7 justify-center items-center'>
              <img src={preview} className="border rounded-full w-32 h-32 object-cover" alt="" />
              <div className='buttons flex justify-center items-center gap-x-4'>
                <FontAwesomeIcon icon={faCheck} className='rounded px-10 py-2 bg-green-600 cursor-pointer' onClick={changeProfilePicture} />
                <FontAwesomeIcon icon={faX} className='rounded px-10 py-2 bg-red-600 cursor-pointer' onClick={() => setpreview(null)} />
              </div>
            </div>
          ) : userData.image ? (
            <div className='flex flex-col gap-y-7 justify-center items-center'>
              <img src={userData.image} className="border rounded-full w-32 h-32 object-cover" alt="" />
              <input onChange={handleImageChange} type="file" accept='image/*' id='image' hidden />
              <div className='flex gap-x-2 items-center'>
                <label htmlFor='image' className='py-1 px-3 ml-4 rounded-lg bg-lightGray text-[#1A0F22] font-bold cursor-pointer'>Change Profile Picture</label>
                <FontAwesomeIcon icon={faTrash} className='text-lg cursor-pointer text-lightGray' onClick={removeProfilePicture} />
              </div>
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center gap-y-7'>
              <FontAwesomeIcon icon={faUser} className="border p-8 rounded-full cursor-pointer text-6xl bg-lightGray text-[#1A0F22]" />
              <input onChange={handleImageChange} type="file" accept='image/*' id='image' hidden />
              <label htmlFor='image' className='py-1 px-3 rounded-lg bg-lightGray text-[#1A0F22] font-bold cursor-pointer'>Change Profile Picture</label>
            </div>
          )}
        </div>

        <div className='profile-details flex flex-col gap-y-[6px]'>
          {['firstName', 'lastName'].map((field) => (
            <div key={field} className='flex justify-between items-center'>
              {editingField === field ? (
                <div className='flex gap-x-2 justify-center items-center'>
                  <p>{field === 'firstName' ? "First Name: " : "Last Name: "}</p>
                  <input type='text' value={tempName} onChange={(e) => settempName(e.target.value)} className='bg-lightGray text-[#1A0F22] px-2 py-1 rounded-md text-sm' />
                  <FontAwesomeIcon icon={faCheck} className='cursor-pointer text-green-500' onClick={() => saveNameChange(field)} />
                  <FontAwesomeIcon icon={faX} className='cursor-pointer text-red-500' onClick={() => seteditingField(null)} />
                </div>
              ) : (
                <>
                  <p>{field === 'firstName' ? `First Name: ${userData.firstName}` : `Last Name: ${userData.lastName}`}</p>
                  <FontAwesomeIcon icon={faPenToSquare} className='cursor-pointer text-lightGray' onClick={() => {
                    seteditingField(field)
                    settempName(userData[field])
                  }} />
                </>
              )}
            </div>
          ))}
          <p>Email: {userData.email}</p>
          <p>Phone Number: {userData.phoneNo}</p>
          {passwordField ? (
            <div className='flex flex-col gap-y-2'>
              {['oldPassword', 'newPassword', 'confirmNewPassword'].map((field, index) => (
                <div key={index} className='flex items-center gap-x-2'>
                  <p>
                    {field === 'oldPassword' ? 'Old Password:' :
                      field === 'newPassword' ? 'New Password:' :
                        'Confirm New Password:'}
                  </p>
                  <input
                    type={passwordVisibility[field] ? 'text' : 'password'}
                    value={passwords[field]}
                    onChange={(e) => handlePasswordChange(field, e.target.value)}
                    className='bg-lightGray text-[#1A0F22] px-2 py-1 rounded-md text-sm w-[40%]'
                    required
                  />
                  <FontAwesomeIcon icon={faEyeSlash} className='text-lightGray text-sm cursor-pointer' onClick={() => togglePasswordVisibility(field)} />
                </div>
              ))}
              <div className='flex gap-x-4'>
                <FontAwesomeIcon icon={faCheck} className='cursor-pointer text-green-500' onClick={savePassword} />
                <FontAwesomeIcon icon={faX} className='cursor-pointer text-red-500' onClick={() => {
                  setpasswordField(false)
                  setpasswordMessage("")
                  setpasswords({
                    oldPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                  })
                }} />
                {passwordMessage && (
                  <p className='text-sm text-red-500 font-bold'>{passwordMessage}</p>
                )}
              </div>
            </div>
          ) : (
            <button className='py-1 px-2 rounded-lg bg-lightGray text-[#1A0F22] font-bold w-[40%] text-sm' onClick={() => setpasswordField(true)}>Change Password</button>
          )}
        </div>
      </div>
    )
  }
}

export default ProfilePopup
