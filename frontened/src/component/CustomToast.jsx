import React from 'react'
import { toast } from 'sonner'

// Bayan Theme Custom Success Toast Config
const successToastStyle = {
  duration: 2000,
  style: {
    background: '#FFFFFF',
    border: '1px solid #F3E8EE',
    borderLeft: '4px solid #851D52',
    color: '#3A0C25',
    borderRadius: '16px',
    padding: '14px 20px',
    minHeight: '52px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 10px 25px -4px rgba(133, 29, 82, 0.08)',
    fontSize: '14px',
    fontWeight: '600',
  },
  icon: (
    <div className="w-6 h-6 rounded-full bg-[#851D52]/10 flex items-center justify-center text-[#851D52] flex-shrink-0 mr-1">
      <svg className="w-3.5 h-3.5 stroke-[#851D52]" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  )
}

export const showToast = {
  success: (message) => toast.success(message, successToastStyle),
  error: (message) => toast.error(message, { duration: 2000 }),
}

export default showToast