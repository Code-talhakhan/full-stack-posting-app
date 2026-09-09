import "./App.css"
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Posts from "./pages/post"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path='/' element={<Posts />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App