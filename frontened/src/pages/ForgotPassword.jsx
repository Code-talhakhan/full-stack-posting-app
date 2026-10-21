import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Lock, ArrowRight, Loader2, Mail } from 'lucide-react'
import { baseUrl } from '../core'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      toast.error('Please enter your email address')
      return
    }

    try {
      setLoading(true)

      
      await axios.post(
        `${baseUrl}/api/v1/send-password-otp`,
        { email: cleanEmail },
        {
          headers: {
            Authorization: '',
            token: ''
          }
        }
      )

      toast.success('OTP sent to your email!')

      navigate('/reset-password', {
        state: { email: cleanEmail }
      })

    } catch (error) {
      console.error('Forgot password error:', error)
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        toast.error('Unauthorized access. Please check backend public routes.')
      } else {
        toast.error(error?.response?.data?.message || 'Failed to send OTP')
      }
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
        
        <div className="w-14 h-14 rounded-2xl bg-[#5E1243]/5 border border-[#5E1243]/15 flex items-center justify-center mb-5 text-[#5E1243]">
          <Lock size={24} strokeWidth={1.8} />
        </div>

        
        <h2 className="text-2xl sm:text-3xl font-bold text-[#4a0d33] tracking-tight mb-1.5">
          Forgot Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 font-normal mb-8 max-w-xs leading-relaxed">
          Enter your email address to receive a 6-digit verification code
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-gray-500 ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3.5 px-4 pl-11 bg-[#FDFBFD] border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/30 focus:border-[#851D52] transition-all"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#851D52] to-[#b3537a] hover:opacity-95 text-white font-semibold text-sm rounded-2xl transition-all duration-200 shadow-md shadow-[#851D52]/15 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>Send Code</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-xs font-normal text-gray-400 mt-8 pt-4 border-t border-gray-100 w-full">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-[#851D52] hover:underline ml-0.5">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default ForgotPassword