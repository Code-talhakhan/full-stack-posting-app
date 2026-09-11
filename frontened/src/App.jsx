import "./App.css"
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios' 
import Posts from "./pages/post"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


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