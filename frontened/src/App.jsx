import "./App.css"
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios' 
import Posts from "./pages/post"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'
import { useEffect } from "react"
import { baseUrl } from "./core"
import { store } from "./store/states"

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


const App = () => {
  const { global_login, global_logout } = store()


  useEffect(() => {
    get_profile()
  }, [])


  const get_profile = async() => {
    try {
      const resp = await axios.get(`${baseUrl}/api/v1/profile`, {
        headers:{
          token: localStorage.getItem("token")
        }
      })
      console.log(resp.data.data)
      global_login()
      
    } catch (error) {
      console.error(error)
      global_logout()
    }
  }


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