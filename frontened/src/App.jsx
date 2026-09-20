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
      
      // Agar token majood hi nahi hai, toh API call ki zaroorat nahi.
      // Direct logout state set karein, lekin 2 second delay ke sath taake splash screen dikhe.
      if (!token) {
        setTimeout(() => {
          global_logout();
        }, 2000); // 2 seconds ka splash screen
        return;
      }

      // Agar token hai, toh backend se verify karein
      const resp = await axios.get(`${baseUrl}/api/v1/profile`, {
        headers: {
          token: token
        }
      });
      
      // Success hone par 2 second baad login true karein aur data pass karein
      setTimeout(() => {
        global_login(resp.data);
      }, 1000);

    } catch (error) {
      console.error(error);
      
      // Error aane par (jaise invalid expire token) bhi 2 second baad logout karein
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