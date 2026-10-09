import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, User, LogOut, MessageSquare, MessageCircle, Menu, X, Search } from 'lucide-react'
import axios from 'axios'
import { store } from '../store/states'

const baseUrl = "http://localhost:3001"
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const Header = ({ hideSearch = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { global_logout, user } = store()

  // Search Bar state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const [userData, setUserData] = useState({ 
    firstname: "User", 
    lastname: "", 
    email: "user@gmail.com" 
  })

  // URL check: Agar route Single Post page par hai (/post/xyz), tab bhi search bar hide kar do
  const isSinglePostRoute = location.pathname.startsWith('/post/')
  const shouldShowSearch = !hideSearch && !isSinglePostRoute

  // Sync search input with URL
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  // DEBOUNCE SEARCH LOGIC (500ms)
  useEffect(() => {
    if (!shouldShowSearch) return

    const timer = setTimeout(() => {
      const trimmedQuery = searchQuery.trim()
      const currentParam = searchParams.get('q') || ''

      if (trimmedQuery !== currentParam) {
        if (trimmedQuery) {
          navigate(`/?q=${encodeURIComponent(trimmedQuery)}`)
        } else if (currentParam) {
          navigate('/')
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, navigate, searchParams, shouldShowSearch])

  const handleClearSearch = () => {
    setSearchQuery('')
    if (searchParams.get('q')) {
      navigate('/')
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        
        const resp = await axios.get(`${baseUrl}/api/v1/profile`, {
          headers: { token: token } 
        })
        
        if (resp?.data?.data) {
          setUserData(resp.data.data) 
        }
      } catch (error) {
        console.error("Profile fetch failed:", error)
      }
    }

    if (user && user.email) {
      setUserData(user)
    } else {
      fetchProfile()
    }
  }, [user])

  const firstName = userData.firstname || "User"
  const lastName = userData.lastname || ""
  const email = userData.email || "user@gmail.com"

  const handleLogout = () => {
    localStorage.removeItem("token")
    global_logout() 
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    navigate("/login")
  }

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-[#851D52] hover:bg-white/50 rounded-lg transition-colors outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link 
              to="/" 
              className="flex items-center gap-2.5 cursor-pointer transition-transform active:scale-95 outline-none flex-shrink-0"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163] flex items-center justify-center shadow-lg shadow-[#851D52]/30">
                <MessageSquare size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span 
                className="hidden sm:block text-2xl font-black bg-gradient-to-r from-[#4a0d33] to-[#851D52] text-transparent bg-clip-text select-none"
                style={{ fontFamily: "'Poppins', 'Outfit', 'Montserrat', system-ui, sans-serif", letterSpacing: "0.5px" }}
              >
                Bayan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-[#fdfafb]/50 p-1.5 rounded-2xl border border-gray-100">
              <Link to="/" className="outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="px-3.5 py-2 rounded-xl flex items-center gap-2 select-none"
                  style={{ backgroundColor: '#ffffff', color: '#851D52' }}
                >
                  <Home size={18} strokeWidth={2.5} />
                  <span className="text-sm font-semibold">Feed</span>
                </motion.div>
              </Link>

              <Link to="/chat" className="outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="px-3.5 py-2 rounded-xl flex items-center gap-2 select-none"
                  style={{ backgroundColor: '#ffffff', color: '#851D52' }}
                >
                  <MessageCircle size={18} strokeWidth={2.5} />
                  <span className="text-sm font-semibold">Chat</span>
                </motion.div>
              </Link>
            </nav>
          </div>

          {/* DEBOUNCE SEARCH BAR (Conditional Display) */}
          {shouldShowSearch ? (
            <div className="flex-1 max-w-xs sm:max-w-md mx-2 relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200/80 rounded-full py-2 pl-9 pr-9 text-xs sm:text-sm text-gray-800 focus:bg-white focus:outline-none focus:border-[#851D52] transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={handleClearSearch} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1"></div>
          )}

          {/* Profile Section */}
          <div className="flex items-center gap-3 relative flex-shrink-0">
            <button 
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen)
                setIsMobileMenuOpen(false)
              }}
              className="w-10 h-10 rounded-full hover:opacity-90 transition-all active:scale-95 z-50 border-none outline-none ring-0 select-none cursor-pointer overflow-hidden"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <img 
                src={userData?.profilePicture || userData?.profilepicture || DEFAULT_AVATAR} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              ></div>
            )}

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-14 right-0 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50 overflow-hidden"
                >
                  <Link 
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-3 border-b border-gray-50 hover:bg-[#fdfafb] transition-colors outline-none select-none cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <p className="text-gray-900 font-semibold text-[15px] truncate capitalize hover:text-[#851D52] transition-colors">
                      {firstName} {lastName}
                    </p>
                    <p className="text-gray-500 text-[13px] truncate mt-0.5">
                      {email}
                    </p>
                  </Link>

                  <div className="py-1.5">
                    <Link 
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-[#fdfafb] hover:text-[#851D52] transition-colors outline-none"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <User size={18} className="text-gray-500" strokeWidth={2} />
                      <span className="text-[14px] font-medium">Your Profile</span>
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left outline-none cursor-pointer"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <LogOut size={18} strokeWidth={2} />
                      <span className="text-[14px] font-medium">Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="sm:hidden overflow-hidden border-t border-gray-100 bg-white/50 backdrop-blur-md rounded-b-2xl mx-[-16px] px-4"
            >
              <div className="py-3 flex flex-col gap-2">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl flex items-center gap-3 select-none"
                    style={{ backgroundColor: '#fdfafb', color: '#851D52' }}
                  >
                    <Home size={20} strokeWidth={2.5} />
                    <span className="font-medium" style={{ fontWeight: 600 }}>Feed</span>
                  </motion.div>
                </Link>

                <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)} className="outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl flex items-center gap-3 select-none"
                    style={{ backgroundColor: '#fdfafb', color: '#851D52' }}
                  >
                    <MessageCircle size={20} strokeWidth={2.5} />
                    <span className="font-medium" style={{ fontWeight: 600 }}>Chat</span>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.header>
  )
}

export default Header