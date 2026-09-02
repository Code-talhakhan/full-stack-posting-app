import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const baseUrl = "http://localhost:3001"

// Inline Input Component
const Input = ({ label, type = "text", placeholder, value, onChange }) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-sm outline-none focus:bg-white focus:border-stone-900 transition-all duration-200"
      />
    </div>
  )
}

// Inline Button Component
const Button = ({ children, disabled, type = "button", onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
    >
      {children}
    </button>
  )
}

const Login = () => {
  const [email, set_email] = useState("")
  const [password, set_password] = useState("")
  const [loading, set_loading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      alert("Please enter both email and password")
      return
    }

    try {
      set_loading(true)

      const resp = await axios.post(`${baseUrl}/api/v1/login`, {
        email: email,
        password: password,
      })

      alert("Login Done")

      // Token Save
      if (resp?.data?.data?.token) {
        localStorage.setItem("token", resp.data.data.token)
      }

      navigate("/")

    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || "Login failed!")
    } finally {
      set_loading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl p-8 shadow-sm">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Login</h2>
          <p className="text-sm text-stone-500 mt-1">
            Welcome back! Enter your details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => set_email(e.target.value)}
          />

          <Input
            placeholder="Enter password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => set_password(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            className="font-medium text-stone-900 hover:underline transition-all"
          >
            Signup
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login