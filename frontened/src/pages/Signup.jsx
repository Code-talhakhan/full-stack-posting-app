import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

// Backend URL (Agar aapka backend kisi aur port par run ho raha hai, toh 3001 badal dein)
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
const Button = ({ children, disabled, type = "submit" }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
    >
      {children}
    </button>
  )
}

// Main Signup Component
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

    // Validations
    if (!firstname.trim() || !lastname.trim() || !email.trim() || !password || !rep_password) {
      alert("Please fill in all fields")
      return
    }

    if (password !== rep_password) {
      alert("Passwords do not match!")
      return
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }

    try {
      set_loading(true)

      // API Call
      const resp = await axios.post(`${baseUrl}/api/v1/signup`, {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
      })

      alert(resp?.data?.message || "Signup Successful!")
      navigate("/login")

    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      set_loading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Create an account</h2>
          <p className="text-sm text-stone-500 mt-1">
            Enter your details below to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="First name"
              label="First name"
              value={firstname}
              onChange={(e) => set_firstname(e.target.value)}
            />
            <Input
              placeholder="Last name"
              label="Last name"
              value={lastname}
              onChange={(e) => set_lastname(e.target.value)}
            />
          </div>

          <Input
            placeholder="name@example.com"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => set_email(e.target.value)}
          />

          <Input
            placeholder="Create password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => set_password(e.target.value)}
          />

          <Input
            placeholder="Confirm password"
            label="Confirm Password"
            type="password"
            value={rep_password}
            onChange={(e) => set_rep_password(e.target.value)}
          />

          <div className="pt-2">
            <Button disabled={loading}>
              {loading ? "Creating account..." : "Signup"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="font-medium text-stone-900 hover:underline transition-all"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup