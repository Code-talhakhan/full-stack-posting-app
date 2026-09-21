import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const SplashScreen = () => {
  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163] overflow-hidden font-sans"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
    >
      
     
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/20 blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10"
      >
        {/* Sirf Loader */}
        <Loader2 className="w-12 h-12 text-white/90 animate-spin" strokeWidth={2.5} />
      </motion.div>
      
    </motion.div>
  )
}

export default SplashScreen