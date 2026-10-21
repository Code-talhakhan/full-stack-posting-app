import React, { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, CheckCircle2, ArrowRight, Mail, RefreshCw } from "lucide-react"
import { baseUrl } from "../core"
import { store } from "../store/states"
import showToast from "../component/CustomToast"

const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = store ? store() : { user: null }

  
  const targetEmail = location?.state?.email || user?.email || ""

  useEffect(() => {
    let interval = null
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timer, canResend])

  const handleChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    if (!/^\d+$/.test(pastedData)) return

    const digits = pastedData.slice(0, 6).split("")
    const newOtp = [...otp]
    digits.forEach((digit, index) => {
      newOtp[index] = digit
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = digit
      }
    })
    setOtp(newOtp)
    const focusIndex = Math.min(digits.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerify = async (e) => {
    if (e) e.preventDefault()
    const otpCode = otp.join("")

    if (otpCode.length < 6) {
      showToast.error("Please enter the complete 6-digit OTP code.")
      return
    }

    if (!targetEmail) {
      showToast.error("Email address missing. Please sign up again.")
      return
    }

    try {
      setLoading(true)
      
     
      await axios.post(`${baseUrl}/api/v1/verify-otp`, {
        otp: otpCode,
        email: targetEmail.toLowerCase(),
      })

      setIsVerified(true)
      showToast.success("Email verified successfully!")

      setTimeout(() => {
        navigate("/login")
      }, 2000)
  
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Invalid or expired OTP code!")
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return
    if (!targetEmail) {
      showToast.error("Email address missing.")
      return
    }

    try {
      setCanResend(false)
      setTimer(60)

     
      await axios.post(`${baseUrl}/api/v1/send-otp`, { 
        email: targetEmail.toLowerCase() 
      })
      
      showToast.success("A new verification code has been sent.")
    } catch (error) {
      showToast.error("Failed to resend code. Try again.")
      setCanResend(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-[#fdfafb] font-sans text-gray-800 selection:bg-[#851D52]/10 selection:text-[#851D52]"
    >
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(133,29,82,0.05)] p-5 sm:p-8 flex flex-col items-center text-center">
        
        <div className="mb-4 sm:mb-6 relative">
          <AnimatePresence mode="wait">
            {!isVerified ? (
              <motion.div
                key="lock"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#851D52]/5 border border-[#851D52]/15 flex items-center justify-center text-[#851D52]"
              >
                <Lock className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.75} />
              </motion.div>
            ) : (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#851D52] flex items-center justify-center text-white shadow-md shadow-[#851D52]/20"
              >
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#5E1243] tracking-tight">
          {isVerified ? "Email Verified!" : "Verify Your Email"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5 max-w-[280px] sm:max-w-xs font-medium leading-relaxed">
          {isVerified ? (
            "Your account is verified. Redirecting you to login..."
          ) : (
            <>
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-gray-700 break-all">
                {targetEmail || "your email address"}
              </span>
            </>
          )}
        </p>

        <form onSubmit={handleVerify} className="w-full mt-6 sm:mt-7 space-y-5 sm:space-y-6">
          <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                disabled={isVerified || loading}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-10 h-12 xs:w-11 xs:h-13 sm:w-12 sm:h-14 text-center text-base sm:text-lg font-bold rounded-lg sm:rounded-xl border transition-all duration-150 focus:outline-none ${
                  digit
                    ? "border-[#851D52] bg-[#851D52]/5 text-[#5E1243]"
                    : "border-gray-200 bg-[#fdfafb] text-gray-800"
                } focus:ring-2 focus:ring-[#851D52]/30 focus:border-[#851D52] disabled:opacity-50`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || isVerified || otp.join("").length < 6}
            className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#5E1243] to-[#9c1f52] hover:opacity-90 text-white font-medium text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50 shadow-md shadow-[#5E1243]/15 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : isVerified ? (
              "Verified Successfully"
            ) : (
              <span className="flex items-center gap-1.5">
                Verify Account <ArrowRight className="w-4 h-4 sm:w-4 sm:h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-7 pt-4 border-t border-gray-100 w-full flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5 text-gray-400">
            <Mail className="w-3.5 h-3.5" /> Didn't get code?
          </span>
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="font-semibold text-[#851D52] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Resend
            </button>
          ) : (
            <span className="text-gray-400 font-normal">
              Resend in <span className="text-[#851D52] font-semibold">{timer}s</span>
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 sm:mt-5">
          Need to change email?{" "}
          <Link to="/signup" className="text-[#851D52] font-medium hover:underline">
            Back to Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default VerifyEmail