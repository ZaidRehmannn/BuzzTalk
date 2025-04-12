import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import ChatPage from './pages/ChatPage/ChatPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

const App = () => {
  return (
    <div className='app'>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/chat' element={<ProtectedRoute><ChatPage /></ProtectedRoute>}></Route>
      </Routes>
    </div>
  )
}

export default App
