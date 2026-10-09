import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import loginPic from "../assets/signup-pic.png" 
import { store } from "../store/states" 

const baseUrl = "http://localhost:3001"

const Input = ({ label, type = "text", placeholder, value, onChange, isPassword }) => {
  const [showPassword, setShowPassword] = useState(false)
  const currentType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label className="text-[12px] font-medium text-gray-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={currentType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full py-2.5 bg-[#fdfafb] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/50 focus:border-transparent transition-all ${isPassword ? 'pl-4 pr-11' : 'px-4'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#851D52] focus:outline-none transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        )}
      </div>
    </div>
  )
}

const Button = ({ children, disabled, type = "button", onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full py-3 px-4 bg-gradient-to-r from-[#5E1243] to-[#9c1f52] hover:opacity-90 text-white font-medium text-sm rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-[#5E1243]/20 mt-2 cursor-pointer"
    >
      {children}
    </button>
  )
}

const Login = () => {
  const { global_login } = store() 
  const [email, set_email] = useState("")
  const [password, set_password] = useState("")
  const [loading, set_loading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password")
      return
    }

    try {
      set_loading(true)

      const resp = await axios.post(`${baseUrl}/api/v1/login`, {
        email: email,
        password: password,
      })

      toast("Login Successful!", {
        icon: <CheckCircle2 size={20} className="text-white" />,
        duration: 1500, 
        style: {
          background: 'linear-gradient(to bottom right, #4a0d33, #851D52, #e87163)',
          color: '#ffffff',
          border: 'none',
        },
      })

      if (resp?.data?.data?.token) {
        const token = resp.data.data.token;
        localStorage.setItem("token", token)
        
        try {
          const profileResp = await axios.get(`${baseUrl}/api/v1/profile`, {
            headers: { token: token }
          });
          global_login(profileResp.data);
        } catch (err) {
          global_login(resp.data.data);
        }
      }

      navigate("/")

    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Invalid credentials!")
    } finally {
      set_loading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen w-full relative flex items-center justify-center p-0 sm:p-4 md:p-6 font-sans bg-white sm:bg-gradient-to-br sm:from-[#4a0d33] sm:via-[#851D52] sm:to-[#e87163] overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Background Glows (PC Only) */}
      <div className="hidden sm:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
      <div className="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full min-h-screen sm:min-h-0 max-w-4xl bg-white sm:rounded-[2rem] sm:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row max-h-none md:max-h-[90vh] overflow-y-auto md:overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* LEFT PANEL: Form Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white min-h-screen sm:min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="text-left sm:text-center mb-6">
            <h2 className="text-3xl sm:text-2xl md:text-3xl font-extrabold sm:font-bold text-[#5E1243]">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
              Please enter your details to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
            <Input
              placeholder="name@example.com"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => set_email(e.target.value)}
            />

            <Input
              placeholder="••••••••"
              label="Password"
              isPassword={true}
              value={password}
              onChange={(e) => set_password(e.target.value)}
            />

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="font-semibold text-[#851D52] hover:underline ml-1"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* RIGHT PANEL: PC Illustration (PC Only) */}
        <div className="hidden md:flex w-1/2 bg-[#fdfafb] p-8 flex-col items-center justify-center border-l border-gray-100">
          <div className="w-full max-w-[450px] mb-6 flex items-center justify-center">
            <img 
              src={loginPic} 
              alt="Login Illustration" 
              className="w-full h-auto object-contain drop-shadow-sm mix-blend-multiply scale-[1.35] transform transition-transform duration-300 hover:scale-150"
            />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Stay Connected
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
            Log back in to check your posts, chat with friends, and share updates.
          </p>
          
          <div className="flex gap-2 mt-8">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-2 bg-[#851D52] rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Login