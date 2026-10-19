import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from "../assets/bayan-logo.png"
import { 
  MessageSquare, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Heart, 
  MessageCircle, 
  Share2,
  Bot 
} from 'lucide-react'

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffdfd] via-[#fdfafb] to-[#f7f0f4] text-gray-800 flex flex-col justify-between overflow-hidden relative selection:bg-[#851D52] selection:text-white">
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#851D52]/15 to-[#e87163]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#4a0d33]/15 to-[#851D52]/10 blur-[140px] pointer-events-none" />

      {/* Top Header / Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          {/* Custom Logo Image with Soft Drop Shadow */}
          <img 
            src={logo} 
            alt="Bayan Logo" 
            className="w-10 h-10 object-contain flex-shrink-0 drop-shadow-[0_8px_16px_rgba(133,29,82,0.35)] group-hover:scale-105 transition-transform duration-300"
          />
          <span 
            className="text-2xl font-black bg-gradient-to-r from-[#4a0d33] to-[#851D52] text-transparent bg-clip-text tracking-tight select-none"
            style={{ fontFamily: "'Poppins', 'Outfit', system-ui, sans-serif" }}
          >
            Bayan
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#5E1243] hover:bg-[#851D52]/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#851D52] hover:bg-[#721845] active:scale-95 text-white shadow-md shadow-[#851D52]/20 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-6xl mx-auto px-6 pt-8 pb-16 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Engaging Headline & CTA */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#851D52]/15 shadow-sm backdrop-blur-md">
            <Sparkles size={16} className="text-[#e87163]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#851D52]">
              Connect • Express • Share
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#3d0a2a] leading-[1.15] tracking-tight">
            Apne Khayalat Ko <br className="hidden sm:block" />
            Eik Naya <span className="bg-gradient-to-r from-[#851D52] to-[#e87163] text-transparent bg-clip-text">Bayan</span> Do.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Real-time posts, seamless discussions, aur dynamic conversations ke saath doston se juden. Apni aawaz ko eik modern aur safe platform par share karein.
          </p>

          {/* Call To Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#4a0d33] via-[#851D52] to-[#e87163] text-white font-bold text-base shadow-xl shadow-[#851D52]/25 hover:shadow-2xl hover:shadow-[#851D52]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              <span>Join Bayan Today</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-gray-200/80 text-[#5E1243] font-bold text-base hover:bg-gray-50/80 hover:border-gray-300 transition-all flex items-center justify-center shadow-sm"
            >
              Explore Feed
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap size={15} className="text-[#851D52]" /> Fast & Realtime
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#851D52]" /> Secure Identity
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={15} className="text-[#851D52]" /> Vibrant Community
            </div>
          </div>
        </motion.div>

        {/* Right Side: Interactive Mockup Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 w-full max-w-md relative"
        >
          {/* Main Card UI Preview */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[32px] p-6 shadow-[0_25px_60px_-15px_rgba(74,13,51,0.15)] relative z-10">
            
            {/* Mock Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#851D52] to-[#e87163] p-0.5">
                  <div className="w-full h-full bg-white rounded-full p-0.5">
                    <div className="w-full h-full bg-[#851D52] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      TK
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3d0a2a]">Talha Khan</h4>
                  <p className="text-[11px] text-gray-400">Just now • @bayan</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#851D52]/10 text-[#851D52] text-[10px] font-bold uppercase">
                Featured
              </span>
            </div>

            {/* Mock Post Content */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Welcome to <span className="font-bold text-[#851D52]">Bayan</span>! 🚀 Experience a clean, fast, and thoughtful platform built for real conversations. What's on your mind today?
            </p>

            {/* Mock Media Placeholder */}
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163] flex items-center justify-center relative overflow-hidden group shadow-inner mb-4">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
              <div className="relative text-center text-white p-4">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-90" />
                <p className="text-xs font-semibold tracking-wide">Connect & Express Yourself</p>
              </div>
            </div>

            {/* Mock Post Actions */}
            <div className="flex items-center justify-between text-gray-500 pt-1 border-t border-gray-100 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-[#851D52] font-semibold">
                <Heart size={16} className="fill-[#851D52]" /> 128
              </div>
              <div className="flex items-center gap-1.5 hover:text-gray-700">
                <MessageCircle size={16} /> 34
              </div>
              <div className="flex items-center gap-1.5 hover:text-gray-700">
                <Share2 size={16} /> Share
              </div>
            </div>
          </div>

          {/* Floating Micro Card 1 */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md border border-gray-100 p-3.5 rounded-2xl shadow-xl z-20 flex items-center gap-3 hidden sm:flex"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Ultra Fast Feed</p>
              <p className="text-[10px] text-gray-400">Instant updates</p>
            </div>
          </motion.div>

          {/* Floating Micro Card 2 */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md border border-gray-100 p-3.5 rounded-2xl shadow-xl z-20 flex items-center gap-3 hidden sm:flex"
          >
            <div className="w-9 h-9 rounded-xl bg-[#851D52]/10 text-[#851D52] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Protected Profile</p>
              <p className="text-[10px] text-gray-400">JWT & Auth Secured</p>
            </div>
          </motion.div>
        </motion.div>

      </main>

      {/* Feature Grid Section */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#851D52]/10 text-[#851D52] flex items-center justify-center mb-4">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#3d0a2a] mb-1">Express Freedom</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Post your thoughts with images, rich text, and instant interactions effortlessly.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#851D52]/10 text-[#851D52] flex items-center justify-center mb-4">
              <Bot size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#3d0a2a] mb-1">Bayan AI Assistant</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Brainstorm ideas, design creative posts, and navigate the platform with your AI companion.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#851D52]/10 text-[#851D52] flex items-center justify-center mb-4">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-[#3d0a2a] mb-1">Privacy First</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Security settings, customized profile controls, and encrypted auth flows.
            </p>
          </div>

        </div>
      </section>

      {/* Simple Clean Footer */}
      <footer className="w-full border-t border-gray-200/60 py-6 text-center text-xs text-gray-400 relative z-10">
        <p>© {new Date().getFullYear()} Bayan. Built with passion for seamless communication.</p>
      </footer>

    </div>
  )
}

export default Welcome