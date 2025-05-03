import React, { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import ChatPage from './pages/ChatPage/ChatPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import LogoutLoader from './components/LogoutLoader/LogoutLoader'
import { StoreContext } from './context/StoreContext';

const App = () => {
  const { loggingOut } = useContext(StoreContext);
  return (
    <div className='app'>
      {loggingOut && (
        <LogoutLoader />
      )}
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/chat' element={<ProtectedRoute><ChatPage /></ProtectedRoute>}></Route>
      </Routes>
    </div>
  )
}

export default App
