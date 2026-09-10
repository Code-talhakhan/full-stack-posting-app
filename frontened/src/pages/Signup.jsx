import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import signupPic from "../assets/signup-pic.png"

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

const Signup = () => {
  const navigate = useNavigate()

  const [firstname, set_firstname] = useState("")
  const [lastname, set_lastname] = useState("")
  const [email, set_email] = useState("")
  const [password, set_password] = useState("")
  const [rep_password, set_rep_password] = useState("")
  const [loading, set_loading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!firstname.trim() || !lastname.trim() || !email.trim() || !password || !rep_password) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== rep_password) {
      toast.error("Passwords do not match!")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    try {
      set_loading(true)
      const resp = await axios.post(`${baseUrl}/api/v1/signup`, {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
      })
      
      // Theme matching maroon/magenta success toast with Check icon
      toast(resp?.data?.message || "Signup Successful!", {
        icon: <CheckCircle2 size={20} className="text-white" />,
        style: {
          background: 'linear-gradient(to bottom right, #4a0d33, #851D52, #e87163)',
          color: '#ffffff',
          border: 'none',
        },
      })
      
      navigate("/login")
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      set_loading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 50 }} 
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163]"
    >
      
      {/* Background abstract overlay effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
        
        <div className="hidden md:flex w-1/2 bg-[#fdfafb] p-8 flex-col items-center justify-center border-r border-gray-100">
         <div className="w-full max-w-[500px] mb-6 flex items-center justify-center">
            <img 
              src={signupPic} 
              alt="Signup Illustration" 
              className="w-full h-auto object-contain drop-shadow-sm mix-blend-multiply scale-[1.35] transform transition-transform duration-300 hover:scale-150"
            />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Join the Elite Community
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
            Unlock exclusive access to a premium posting platform and network.
          </p>
          
          <div className="flex gap-2 mt-8">
            <div className="w-2 h-2 bg-[#851D52] rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5E1243]">Sign up</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-w-sm mx-auto w-full">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="First name"
                value={firstname}
                onChange={(e) => set_firstname(e.target.value)}
              />
              <Input
                label="Last name"
                value={lastname}
                onChange={(e) => set_lastname(e.target.value)}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => set_email(e.target.value)}
            />

            <Input
              label="Password"
              isPassword={true}
              value={password}
              onChange={(e) => set_password(e.target.value)}
            />

            <Input
              label="Confirm Password"
              isPassword={true}
              value={rep_password}
              onChange={(e) => set_rep_password(e.target.value)}
            />

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </div>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-6">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-semibold text-[#851D52] hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </motion.div>
  )
}

export default Signup