import "./App.css"
import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios' 
import Posts from "./pages/post"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import VerifyEmail from "./pages/VerifyEmail.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
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
        }, 1200); 
        return;
      }

      const resp = await axios.get(`${baseUrl}/api/v1/profile`);
      
      setTimeout(() => {
        global_login(resp.data);
      }, 1000);

    } catch (error) {
      console.error("PROFILE_FETCH_ERROR:", error);
      
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
        {/* SHARED ROUTES */}
        <Route path="/post/:postId" element={<SinglePostPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* LOGGED OUT USERS */}
        {isLogin === false && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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