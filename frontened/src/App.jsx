import "./App.css"
import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios' 
import Posts from "./pages/post"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Profile from "./pages/Profile"
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'
import { baseUrl } from "./core"
import { store } from "./store/states"
import SplashScreen from "./component/SplashScreen"
import { AnimatePresence } from 'framer-motion'

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
  const { global_login, global_logout, user, isLogin } = store()


  useEffect(() => {
    get_profile()
  }, [])


  const get_profile = async () => {
    try {
      const token = localStorage.getItem("token");
      
     
      if (!token) {
        setTimeout(() => {
          global_logout();
        }, 2000); 
        return;
      }

      
      const resp = await axios.get(`${baseUrl}/api/v1/profile`, {
        headers: {
          token: token
        }
      });
      
     
      setTimeout(() => {
        global_login(resp.data);
      }, 1000);

    } catch (error) {
      console.error(error);
      
     
      setTimeout(() => {
        global_logout();
      }, 1000);
    }
  };


  return (
    <>
      <Toaster position="top-right" richColors />

       {isLogin == null ? <SplashScreen /> : null}

      {
        isLogin == true ?
          <Routes>
            <Route path='/' element={<Posts />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='*' element={<Navigate to="/" />} />
          </Routes> :
          null
      }

      {
        isLogin == false ?
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='*' element={<Navigate to="/login" />} />
          </Routes> :
          null
      }
    </>
  )
}

export default App