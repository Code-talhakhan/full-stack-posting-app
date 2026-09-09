import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F3F5F9] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative inline-block mb-6">
          {/* Question Mark Icon Container */}
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-12 h-12 text-[#4361EE]" />
          </div>
          
          {/* Transparent 404 positioned at top-right of the icon */}
          <span className="absolute -top-3 -right-8 text-3xl sm:text-4xl font-black text-gray-200/80 select-none tracking-tighter">
            404
          </span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-gray-500 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist.
        </p>
        
        <div className="flex justify-center">
          <Link 
            to="/login" 
            className="w-full py-3 px-4 bg-[#4361EE] hover:bg-[#3651D4] text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-500/30 text-center"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;