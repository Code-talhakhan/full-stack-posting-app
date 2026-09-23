import React from 'react'

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

export default Button