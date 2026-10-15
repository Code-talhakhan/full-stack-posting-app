import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { baseUrl } from '../core'

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const initialEmail = location.state?.email || ''
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [resendTimer, setResendTimer] = useState(55)
  const [canResend, setCanResend] = useState(false)

  // Resend Timer Countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(timer)
  }, [resendTimer])

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (!canResend || !email) return
    try {
      await axios.post(`${baseUrl}/api/v1/send-password-otp`, { email })
      toast.success('New OTP sent to your email!')
      setResendTimer(55)
      setCanResend(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP')
    }
  }

  // Reset Password Submit
  const handleResetPassword = async (e) => {
    e.preventDefault()

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    if (!cleanEmail) {
      toast.error("Please enter your email address")
      return
    }

    if (!cleanOtp) {
      toast.error("Please enter the OTP code")
      return
    }

    if (!newPassword) {
      toast.error("Please enter your new password")
      return
    }

    try {
      setLoading(true)

      const resp = await axios.post(`${baseUrl}/api/v1/forgot-password-complete`, {
        email: cleanEmail,
        otp: cleanOtp,
        newPassword: newPassword
      })

      toast.success(resp?.data?.message || "Password updated successfully!")
      navigate('/login')

    } catch (error) {
      console.error("Reset Password Error:", error)
      toast.error(error?.response?.data?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F9FAFB] font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100/80 flex flex-col items-center text-center"
      >
        {/* Top Lock Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#5E1243]/5 border border-[#5E1243]/15 flex items-center justify-center mb-5 text-[#5E1243]">
          <Lock size={24} strokeWidth={1.8} />
        </div>

        {/* Soft Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#4a0d33] tracking-tight mb-1.5">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-normal mb-6">
          Enter the OTP sent to your email along with your new password
        </p>

        {/* Form */}
        <form onSubmit={handleResetPassword} className="w-full space-y-4">
          
          {/* Email Address Input */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-medium text-gray-500 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#FDFBFD] border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/30 focus:border-[#851D52] transition-all"
            />
          </div>

          {/* Clean Single OTP Code Input */}
          <div className="flex flex-col gap-1 text-left pt-1">
            <label className="text-xs font-medium text-gray-500 ml-1">Verification Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit OTP code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#FDFBFD] border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/30 focus:border-[#851D52] transition-all tracking-wider font-medium"
            />
          </div>

          {/* New Password Input */}
          <div className="flex flex-col gap-1 text-left pt-1">
            <label className="text-xs font-medium text-gray-500 ml-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-2.5 pl-4 pr-11 bg-[#FDFBFD] border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/30 focus:border-[#851D52] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#851D52] focus:outline-none transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-[#851D52] hover:bg-[#721845] text-white font-semibold text-sm rounded-2xl transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-3"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="flex items-center justify-between w-full text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100 font-normal">
          <span>Didn't get code?</span>
          {canResend ? (
            <button
              onClick={handleResendOtp}
              className="font-semibold text-[#851D52] hover:underline cursor-pointer"
            >
              Resend Code
            </button>
          ) : (
            <span>Resend in <strong className="text-[#851D52] font-semibold">{resendTimer}s</strong></span>
          )}
        </div>

        {/* Change Email Option */}
        <p className="text-xs font-normal text-gray-400 mt-3">
          Need to change email?{" "}
          <Link to="/forgot-password" className="font-semibold text-[#851D52] hover:underline ml-0.5">
            Back to Forgot Password
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default ResetPassword