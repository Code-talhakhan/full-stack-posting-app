import React from 'react'
import { motion } from 'framer-motion'
import logo from "../assets/bayan-logo.png"

const SplashScreen = () => {
  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between py-12 bg-gradient-to-br from-[#fffdfd] via-[#fdfafb] to-[#f7f0f4] overflow-hidden font-sans selection:bg-[#851D52] selection:text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
    >
    
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#851D52]/15 to-[#e87163]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#4a0d33]/15 to-[#851D52]/10 blur-[140px] pointer-events-none" />

   
      <div className="w-full"></div>


      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center gap-2 sm:gap-3 relative z-10 overflow-visible py-2"
      >
  
        <motion.img 
          src={logo} 
          alt="Bayan Logo" 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 sm:w-18 sm:h-18 object-contain flex-shrink-0 drop-shadow-[0_10px_20px_rgba(133,29,82,0.3)]"
        />

    
        <span 
          className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-[#4a0d33] to-[#851D52] text-transparent bg-clip-text tracking-tight select-none leading-normal py-1"
          style={{ fontFamily: "'Poppins', 'Outfit', system-ui, sans-serif" }}
        >
          Bayan
        </span>
      </motion.div>

      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-1 select-none"
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">
          from
        </span>
        <span 
          className="text-sm font-bold bg-gradient-to-r from-[#4a0d33] via-[#851D52] to-[#e87163] text-transparent bg-clip-text tracking-wider"
          style={{ fontFamily: "'Poppins', 'Outfit', system-ui, sans-serif" }}
        >
          Talha Khan
        </span>
      </motion.div>
      
    </motion.div>
  )
}

export default SplashScreen