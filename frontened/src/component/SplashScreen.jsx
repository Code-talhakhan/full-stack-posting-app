import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

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
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10"
      >
        
        <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="text-white w-12 h-12" />
          </motion.div>
        </div>
        
        
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-[0.2em] mb-3">
          ELITE
        </h1>
        
       
        <div className="flex items-center gap-2.5 text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span className="text-xs sm:text-sm tracking-widest uppercase font-medium">Starting Platform...</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SplashScreen