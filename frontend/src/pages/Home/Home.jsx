import React, { useContext, useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Home = () => {
  const { url } = useContext(StoreContext);
  const [errorMessage, seterrorMessage] = useState("");
  const [successMessage, setsuccessMessage] = useState("");

  const navigate = useNavigate();
  const sliderRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/chat", { replace: true });
    }
  }, [navigate]);

  const goToLogin = () => {
    sliderRef.current.slickGoTo(0);
  };

  const goToSignup = () => {
    sliderRef.current.slickGoTo(1);
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  const [signupData, setsignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    password: ""
  });

  const [loginData, setloginData] = useState({
    loginIdentifier: "",
    password: ""
  });

  const [passwordVisibility, setpasswordVisibility] = useState({
    loginPassword: false,
    signupPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setpasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSignupChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setsignupData(signupData => ({ ...signupData, [name]: value }));
  };

  const handleLoginChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setloginData(loginData => ({ ...loginData, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    seterrorMessage("");
    const response = await axios.post(url + '/api/user/login', loginData);
    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      navigate('/chat');
    }
    else {
      seterrorMessage(response.data.message);
    }
  };

  const onSignup = async (event) => {
    event.preventDefault();
    seterrorMessage("");
    setsuccessMessage("");
    const response = await axios.post(url + '/api/user/register', signupData);
    if (response.data.success) {
      setsuccessMessage(response.data.message);

      setsignupData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNo: "",
        password: ""
      });

      setTimeout(() => {
        goToLogin();
        setTimeout(() => {
          setsuccessMessage("");
        }, 500);
      }, 2000);
    }
    else {
      seterrorMessage(response.data.message);
    }
  };

  return (
    <div className='container flex flex-col lg:flex-row min-h-screen min-w-full'>
      <div className='left-panel lg:w-1/2 flex flex-col lg:justify-center lg:gap-y-3 p-6 md:p-10 lg:p-14 xl:p-20 lg:pb-40 xl:pb-44 lg:pl-20 xl:pl-36'>
        <div className='heading flex gap-x-2 lg:gap-x-3'>
          <h1 className='text-5xl lg:text-7xl'>BuzzTalk</h1>
          <FontAwesomeIcon icon={faMessage} className="text-4xl pt-2 lg:pt-4 lg:text-5xl " />
        </div>
        <div className='description pl-1 pt-2 lg:pt-0'>
          <p className='text-lg text-lightGray'>BuzzTalk brings people together, letting you chat, share, and connect effortlessly with those who matter most</p>
        </div>
      </div>

      <div className="right-panel lg:w-1/2 flex justify-center items-center pt-4 xl:pr-20">
        <div className="w-full px-9 md:px-32 lg:w-80 lg:px-0">
          <Slider {...settings} ref={sliderRef}>
            {/* Login Form */}
            <div className='pt-10'>
              <div className="login-box bg-lightGray w-full flex flex-col h-auto rounded-lg p-5">
                <h2 className="heading text-lightPurple text-3xl font-bold">Login</h2>
                <form className="flex flex-col justify-center items-center py-8" onSubmit={onLogin}>
                  <div className="login-credentials flex flex-col py-3 gap-y-3 w-full">
                    <input type="text" placeholder="Email or Phone Number" className="border-2 border-lightGray p-2 text-sm text-black rounded-lg" name='loginIdentifier' value={loginData.loginIdentifier} onChange={handleLoginChange} required />
                    <div className='flex items-center'>
                      <input type={passwordVisibility["loginPassword"] ? 'text' : 'password'} placeholder="Password" className="border-2 border-lightGray p-2 text-sm text-black rounded-lg w-full" name='password' value={loginData.password} onChange={handleLoginChange} required />
                      <FontAwesomeIcon icon={faEyeSlash} className='text-lightPurple p-2 cursor-pointer' onClick={() => togglePasswordVisibility("loginPassword")} />
                    </div>
                    {errorMessage && (
                      <p className='text-sm text-red-500 font-bold'>{errorMessage}</p>
                    )}
                  </div>
                  <button type='submit' className="bg-lightPurple w-1/2 rounded-lg p-1 my-2">Login</button>
                  <p className="text-black text-xs pt-3">Don't have an account?{' '}
                    <span className="font-bold text-lightPurple cursor-pointer" onClick={goToSignup}>
                      Click here to Sign Up
                    </span>
                  </p>
                </form>
              </div>
            </div>

            {/* Signup Form */}
            <div className="signup-box bg-lightGray w-full flex flex-col h-auto rounded-lg p-5">
              <h2 className="heading text-lightPurple text-3xl font-bold">Sign Up</h2>
              <form className="flex flex-col justify-center items-center py-8" onSubmit={onSignup}>
                <div className="signup-credentials flex flex-col py-3 gap-y-3 w-full">
                  <div className="name-info flex gap-x-1">
                    <input type="text" placeholder="Firstname" className="border-2 border-lightGray p-2 w-1/2 text-sm text-black rounded-lg" name='firstName' value={signupData.firstName} onChange={handleSignupChange} required />
                    <input type="text" placeholder="Lastname" className="border-2 border-lightGray p-2 w-1/2 text-sm text-black rounded-lg" name='lastName' value={signupData.lastName} onChange={handleSignupChange} required />
                  </div>
                  <input type="text" placeholder="Email" className="border-2 border-lightGray p-2 text-sm text-black rounded-lg" name='email' value={signupData.email} onChange={handleSignupChange} required />
                  <input type="text" placeholder="Phone Number" className="border-2 border-lightGray p-2 text-sm text-black rounded-lg" name='phoneNo' value={signupData.phoneNo} onChange={handleSignupChange} required />
                  <div className='flex items-center'>
                    <input type={passwordVisibility["signupPassword"] ? 'text' : 'password'} placeholder="Password" className="border-2 border-lightGray p-2 text-sm text-black rounded-lg w-full" name='password' value={signupData.password} onChange={handleSignupChange} required />
                    <FontAwesomeIcon icon={faEyeSlash} className='text-lightPurple p-2 cursor-pointer' onClick={() => togglePasswordVisibility("signupPassword")} />
                  </div>
                  {errorMessage && (
                    <p className='text-sm text-red-500 font-bold'>{errorMessage}</p>
                  )}
                  {successMessage && (
                    <p className='text-sm text-green-500 font-bold'>{successMessage}</p>
                  )}
                </div>
                <button type='submit' className="bg-lightPurple w-1/2 rounded-lg p-1 my-2">Create Account</button>
                <p className="text-black text-xs pt-3">Already have an account?{' '}
                  <span className="font-bold text-lightPurple cursor-pointer" onClick={goToLogin}>
                    Click here to Login
                  </span>
                </p>
              </form>
            </div>
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Home;
