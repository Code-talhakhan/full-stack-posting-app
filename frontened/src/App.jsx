import "./App.css"
import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios' 
import Posts from "./pages/post"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Profile from "./pages/Profile"
import SinglePostPage from "./pages/SinglePostPage.jsx"
import { Toaster } from 'sonner'
import { baseUrl } from "./core"
import { store } from "./store/states"
import SplashScreen from "./component/SplashScreen"

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
  const { global_login, global_logout, isLogin } = store()

  useEffect(() => {
    get_profile()
  }, [])

  const get_profile = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setTimeout(() => {
          global_logout();
        }, 1500); 
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

  if (isLogin === null) {
    return <SplashScreen />
  }

  return (
    <>
      <Toaster position="top-right" richColors />

      <Routes>
        {/* SHARED PUBLIC/LOGGED IN ROUTE: Single post page route har case me open hona chahiye */}
        <Route path="/post/:postId" element={<SinglePostPage />} />

        {/* LOGGED OUT USERS */}
        {isLogin === false && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* LOGGED IN USERS */}
        {isLogin === true && (
          <>
            <Route path="/" element={<Posts />} />
            <Route path="/profile" element={<Profile />} /> 
            <Route path="/profile/:userId" element={<Profile />} /> 
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
  )
}

export default App