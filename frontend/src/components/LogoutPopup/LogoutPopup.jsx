import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext.jsx';

const LogoutPopup = ({ setlogoutPopup }) => {
    const { resetStore, setloggingOut } = useContext(StoreContext);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        resetStore();
        setloggingOut(true);

        setTimeout(() => {
            // Resetting the state
            setloggingOut(false);
            navigate("/", { replace: true });
        }, 2000);
    };

    return (
        <div className='popup-box flex flex-col border rounded py-5 px-12 bg-gradient-to-tl from-[#2D132C] to-[#2E1A47] gap-y-3'>
            <h1 className='text-lightGray font-semibold text-2xl'>Log out confirmation</h1>
            <p className='text-sm'>Are you sure you want to log out?</p>
            <div className='buttons flex gap-x-3 w-full'>
                <button className='px-3 py-1 w-1/2 bg-lightPurple rounded' onClick={() => logout()}>Yes</button>
                <button className='px-3 py-1 w-1/2 bg-gray-400 rounded' onClick={() => setlogoutPopup(false)}>No</button>
            </div>
        </div>
    )
}

export default LogoutPopup
