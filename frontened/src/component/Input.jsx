import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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

export default Input