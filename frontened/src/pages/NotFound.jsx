import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163]">
      
      {/* Background abstract overlay effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

      <motion.div 
        className="relative z-10 max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative inline-block mb-6">
          {/* Question Mark Icon Container */}
          <div className="w-24 h-24 bg-[#851D52]/10 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-12 h-12 text-[#851D52]" />
          </div>
          
          {/* Transparent 404 positioned at top-right of the icon */}
          <span className="absolute -top-3 -right-8 text-3xl sm:text-4xl font-black text-gray-200/80 select-none tracking-tighter">
            404
          </span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-[#5E1243] tracking-tight">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-gray-500 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist.
        </p>
        
        <div className="flex justify-center">
          <Link 
            to="/login" 
            className="w-full py-3 px-4 bg-gradient-to-r from-[#5E1243] to-[#9c1f52] hover:opacity-90 text-white font-medium text-sm rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#5E1243]/20 text-center inline-block"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;