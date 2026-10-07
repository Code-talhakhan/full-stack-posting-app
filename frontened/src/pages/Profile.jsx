import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { store } from '../store/states'
import axios from 'axios'
import { baseUrl } from '../core'
import moment from 'moment'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Camera, 
  X, 
  Save, 
  ShieldCheck, 
  FileText, 
  Calendar,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Heart,
  MessageCircle,
  Share2,
  AlertTriangle,
  Send
} from 'lucide-react'
import Input from "../component/Input"
import Header from "../component/Header"

const API_POST_URL = `${baseUrl}/api/v1/post`
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const toastStyle = {
  background: 'linear-gradient(to bottom right, #4a0d33, #851D52, #e87163)',
  color: '#ffffff',
  border: 'none',
}

const Profile = () => {
  const navigate = useNavigate()
  const { userId } = useParams() 
  const { user, global_login } = store()

  const [viewUser, setViewUser] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Posts State
  const [userPosts, setUserPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  // Actions & Modals State
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [deleteTarget, set_deleteTarget] = useState(null)
  const [deleting, set_deleting] = useState(false)
  const [editTarget, set_editTarget] = useState(null)
  const [editTitle, set_editTitle] = useState("")
  const [editDescription, set_editDescription] = useState("")
  const [savingPost, set_savingPost] = useState(false)

  // Like & Comment Modal States
  const [likedPosts, setLikedPosts] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [selectedPostModal, setSelectedPostModal] = useState(null)
  const [modalCommentText, setModalCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  const currentUserId = String(
    user?.data?.user?._id || user?.user?._id || user?.data?._id || user?._id || ""
  );

  const loggedInUserData = user?.data?.user || user?.user || user?.data || user || {};

  const isOwnProfile = !userId || String(userId) === String(currentUserId);
  const targetUserId = isOwnProfile ? String(currentUserId) : String(userId);

  useEffect(() => {
    fetchProfileAndPosts()
  }, [userId, isOwnProfile]) 

  const fetchProfileAndPosts = async () => {
    try {
      setLoadingProfile(true)
      setLoadingPosts(true)
      const token = localStorage.getItem("token")

      // 1. Fetch User Data
      if (!isOwnProfile && userId) {
        const resp = await axios.get(`${baseUrl}/api/v1/user/${userId}`, {
          headers: { token }
        })
        setViewUser(resp.data.data || resp.data)
      } else {
        const resp = await axios.get(`${baseUrl}/api/v1/profile`, {
          headers: { token }
        })
        global_login(resp.data)
        setViewUser(resp.data.data || resp.data)
      }

      // 2. Fetch All Posts & Filter for Target Profile User
      const postsResp = await axios.get(API_POST_URL, {
        headers: { token }
      })

      const allPosts = postsResp.data.data || []
      const filtered = allPosts.filter((singlePost) => {
        const postAuthor = singlePost?.authorId || singlePost?.user || singlePost?.author || {}
        const postAuthorId = String(postAuthor?._id || postAuthor?.id || (typeof postAuthor === 'string' ? postAuthor : ""))
        return postAuthorId === targetUserId
      })

      setUserPosts(filtered)

      // Sync modal if open
      if (selectedPostModal) {
        const updatedTarget = filtered.find(p => (p._id || p.id) === (selectedPostModal._id || selectedPostModal.id))
        if (updatedTarget) setSelectedPostModal(updatedTarget)
      }

      // Initialize Likes logic
      const initialLikes = {}
      const initialCounts = {}
      filtered.forEach(post => {
        const pId = post._id || post.id
        const likesArr = post.likes || []
        initialLikes[pId] = likesArr.some(id => String(id?._id || id) === currentUserId)
        initialCounts[pId] = likesArr.length || 0
      })
      setLikedPosts(initialLikes)
      setLikeCounts(initialCounts)

    } catch (error) {
      console.error("Failed to fetch profile/posts data", error)
      toast.error("Failed to load profile data")
    } finally {
      setLoadingProfile(false)
      setLoadingPosts(false)
    }
  }

  const displayData = isOwnProfile ? loggedInUserData : (viewUser || {})

  const defaultFirstName = displayData?.firstname || displayData?.firstName || displayData?.name || "User"
  const defaultLastName = displayData?.lastname || displayData?.lastName || ""
  const defaultEmail = displayData?.email || "Email not found"
  const defaultPostCount = userPosts.length
  const memberSince = displayData?.createdAt 
    ? new Date(displayData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : "Recently"

  // Modal States
  const [editOpen, set_editOpen] = useState(false)
  const [securityOpen, set_securityOpen] = useState(false)
  
  const [editFirstname, set_editFirstname] = useState("")
  const [editLastname, set_editLastname] = useState("")
  const [savingName, set_savingName] = useState(false)

  const openEditModal = () => {
    set_editFirstname(defaultFirstName !== "User" ? defaultFirstName : "")
    set_editLastname(defaultLastName)
    set_editOpen(true)
  }

  const closeEditModal = () => {
    if (savingName) return
    set_editOpen(false)
  }

  const saveProfile = async () => {
    if (!editFirstname.trim()) {
      toast.error("First name is required")
      return
    }

    try {
      set_savingName(true)
      await axios.put(`${baseUrl}/api/v1/profile`, {
        firstname: editFirstname,
        lastname: editLastname,
      }, {
        headers: { token: localStorage.getItem("token") }
      })

      global_login({
        ...user,
        data: {
          ...loggedInUserData,
          firstname: editFirstname,
          lastname: editLastname,
        }
      })

      toast.success("Profile updated", { style: toastStyle })
      set_editOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Failed to update profile")
    } finally {
      set_savingName(false)
    }
  }

  // Security password handler
  const [current_password, set_current_password] = useState("")
  const [new_password, set_new_password] = useState("")
  const [rep_password, set_rep_password] = useState("")
  const [savingPassword, set_savingPassword] = useState(false)

  const closeSecurityModal = () => {
    if (savingPassword) return
    set_securityOpen(false)
    set_current_password("")
    set_new_password("")
    set_rep_password("")
  }

  const updatePassword = async () => {
    if (!current_password) return toast.error("Current password is required")
    if (!new_password) return toast.error("New password is required")
    if (new_password.length < 8) return toast.error("New password must be at least 8 characters long")
    if (rep_password !== new_password) return toast.error("Passwords do not match")

    try {
      set_savingPassword(true)
      await axios.put(`${baseUrl}/api/v1/password`, {
        currentPassword: current_password,
        newPassword: new_password,
      }, {
        headers: { token: localStorage.getItem("token") }
      })

      toast.success("Password updated", { style: toastStyle })
      closeSecurityModal()
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Failed to update password")
    } finally {
      set_savingPassword(false)
    }
  }

  // Profile Picture Upload
  const [uploading, set_uploading] = useState(false)

  const upload_file = async (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append("my-file", file)

    try {
      set_uploading(true)
      const resp = await axios.put(`${baseUrl}/api/v1/profile-picture`, formData, {
        headers: { token: localStorage.getItem("token") }
      })

      global_login({
        ...user,
        data: {
          ...loggedInUserData,
          profilePicture: resp.data.url,
          profilepicture: resp.data.url
        }
      })

      toast.success("Profile picture updated", { style: toastStyle })
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Failed to upload picture")
    } finally {
      set_uploading(false)
    }
  }

  // Like Toggle
  const handleLike = async (postId) => {
    if (!currentUserId) {
      toast.error("Please login first")
      return
    }

    const isCurrentlyLiked = !!likedPosts[postId]
    const currentCount = likeCounts[postId] || 0
    const updatedCount = isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1

    setLikedPosts(prev => ({ ...prev, [postId]: !isCurrentlyLiked }))
    setLikeCounts(prev => ({ ...prev, [postId]: updatedCount }))

    try {
      const token = localStorage.getItem("token")
      const resp = await axios.post(`${API_POST_URL}/${postId}/like`, {}, { headers: { token } })
      if (resp.data) {
        setLikedPosts(prev => ({ ...prev, [postId]: resp.data.liked }))
        setLikeCounts(prev => ({ ...prev, [postId]: resp.data.likesCount }))
      }
    } catch (error) {
      setLikedPosts(prev => ({ ...prev, [postId]: isCurrentlyLiked }))
      setLikeCounts(prev => ({ ...prev, [postId]: currentCount }))
      console.error("Error toggling like:", error)
      toast.error("Failed to update like status")
    }
  }

  // Add Comment via Modal
  const handleAddModalComment = async (postId) => {
    if (!modalCommentText.trim()) return

    try {
      setSubmittingComment(true)
      const token = localStorage.getItem("token")
      const resp = await axios.post(`${API_POST_URL}/${postId}/comment`, {
        text: modalCommentText
      }, {
        headers: { token }
      })

      if (resp.data?.data) {
        setSelectedPostModal(resp.data.data)
        setModalCommentText("")
        toast.success("Comment posted")
        fetchProfileAndPosts()
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Toggle Comment Like
  const handleToggleCommentLike = async (postId, commentId) => {
    if (!currentUserId) {
      toast.error("Please login first")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const resp = await axios.post(`${API_POST_URL}/${postId}/comment/${commentId}/like`, {}, {
        headers: { token }
      })

      if (resp.data?.data) {
        setSelectedPostModal(resp.data.data)
        fetchProfileAndPosts()
      }
    } catch (error) {
      console.error("Error liking comment:", error)
      toast.error("Failed to toggle comment like")
    }
  }

  // Share Handler
  const handleShare = async (postId, title) => {
    const shareUrl = `${window.location.origin}/post/${postId}`
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      toast.success("Link copy to clipboard!", { style: toastStyle })
    } catch (err) {
      console.error("Failed to copy link:", err)
      toast.error("Failed to copy link")
    }
  }

  // Delete Post Handlers
  const confirmDeletePost = async () => {
    if (!deleteTarget) return
    try {
      set_deleting(true)
      const token = localStorage.getItem("token")
      await axios.delete(`${API_POST_URL}/${deleteTarget}`, { headers: { token } })
      toast.success("Post deleted", { style: toastStyle })
      set_deleteTarget(null)
      fetchProfileAndPosts()
    } catch (error) {
      toast.error("Failed to delete post")
    } finally {
      set_deleting(false)
    }
  }

  // Edit Post Handlers
  const confirmEditPost = async () => {
    if (!editTarget || !editTitle.trim() || !editDescription.trim()) {
      toast.error("Title and description are required")
      return
    }

    try {
      set_savingPost(true)
      const token = localStorage.getItem("token")
      await axios.put(`${API_POST_URL}/${editTarget}`, {
        title: editTitle,
        description: editDescription
      }, { headers: { token } })

      toast.success("Post updated", { style: toastStyle })
      set_editTarget(null)
      fetchProfileAndPosts()
    } catch (error) {
      toast.error("Failed to update post")
    } finally {
      set_savingPost(false)
    }
  }

  if (loadingProfile && !viewUser) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#851D52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-gray-500 hover:text-[#851D52] hover:bg-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div className="h-6 w-1.5 bg-gradient-to-b from-[#4a0d33] to-[#e87163] rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {isOwnProfile ? "Your Profile" : `${defaultFirstName}'s Profile`}
          </h2>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-6"
        >
          <div className="relative w-32 h-32 flex-shrink-0">
            <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163]">
              <img
                src={displayData?.profilePicture || displayData?.profilepicture || DEFAULT_AVATAR}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
              />
            </div>

            {isOwnProfile && (
              <>
                <input
                  type="file"
                  hidden
                  id="profile-selector"
                  accept="image/*"
                  onChange={(e) => {
                    upload_file(e.target.files[0])
                    e.target.value = null
                  }}
                />
                <label
                  htmlFor="profile-selector"
                  className="absolute right-0 bottom-0 w-9 h-9 rounded-full bg-gradient-to-r from-[#5E1243] to-[#9c1f52] flex items-center justify-center shadow-lg shadow-[#5E1243]/30 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Camera size={16} className="text-white" strokeWidth={2} />
                </label>
              </>
            )}
          </div>

          <div className="flex flex-col items-center sm:items-start flex-1 w-full mt-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-1 capitalize">
              {defaultFirstName} {defaultLastName}
            </h3>
            <p className="text-[#851D52] font-medium mb-5">{defaultEmail}</p>

            {uploading && (
              <p className="text-xs text-gray-400 mb-4">Uploading photo...</p>
            )}

            {isOwnProfile && (
              <div className="flex items-center gap-3">
                <button
                  onClick={openEditModal}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => set_securityOpen(true)}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Security
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#851D52]/10 flex items-center justify-center text-[#851D52]">
              <FileText size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Posts Created</p>
              <h4 className="text-2xl font-bold text-gray-900">{defaultPostCount}</h4>
            </div>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#4a0d33]/10 flex items-center justify-center text-[#4a0d33]">
              <Calendar size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Member Since</p>
              <h4 className="text-xl font-bold text-gray-900">{memberSince}</h4>
            </div>
          </div>
        </motion.div>

        {/* Wider Light Divider Line */}
        <div className="flex justify-center mb-8">
          <div className="w-[96%] border-t border-gray-200/70"></div>
        </div>

        {/* Posts Heading with Vertical Gradient Bar */}
        <div className="flex items-center gap-2.5 mb-6 px-1">
          <div className="h-7 w-2 bg-gradient-to-b from-[#4a0d33] via-[#851D52] to-[#e87163] rounded-full"></div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
            {isOwnProfile ? "Your Posts" : `${defaultFirstName}'s Posts`}
          </h3>
        </div>

        {/* Render User Posts */}
        {loadingPosts ? (
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 animate-pulse h-36"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {userPosts.length > 0 ? (
                userPosts.map((singlePost, index) => {
                  const postId = singlePost._id || singlePost.id
                  const postDate = singlePost.updatedAt || singlePost.createdAt
                  const commentCount = singlePost?.comments?.length || 0

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                      key={postId}
                      className="bg-white p-5 sm:p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-[#851D52]/20 transition-all duration-300 relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163] flex-shrink-0 shadow-sm">
                            <img 
                              src={displayData?.profilePicture || displayData?.profilepicture || DEFAULT_AVATAR} 
                              alt="User" 
                              className="w-full h-full rounded-full object-cover border border-white"
                            />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-bold text-gray-900 text-[15px] capitalize">
                              {defaultFirstName} {defaultLastName}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{postDate ? moment(postDate).fromNow() : "Recently"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions for Own Post */}
                        {isOwnProfile && (
                          <div className="relative z-10">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === postId ? null : postId)}
                              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors outline-none cursor-pointer"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                              {activeDropdown === postId && (
                                <>
                                  <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}></div>
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-gray-100 z-40 py-1 overflow-hidden"
                                  >
                                    <button
                                      onClick={() => {
                                        set_editTarget(postId)
                                        set_editTitle(singlePost.title || "")
                                        set_editDescription(singlePost.description || "")
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] text-gray-700 hover:bg-[#fdfafb] hover:text-[#851D52] transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        set_deleteTarget(postId)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      <div className="pl-1 mb-4">
                        <h4 className="font-bold text-gray-900 text-[17px] mb-1.5">{singlePost.title}</h4>
                        <p className="text-gray-600 text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-line break-words">
                          {singlePost.description}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-start gap-4 text-gray-700 text-sm font-medium">
                        <button
                          onClick={() => handleLike(postId)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                            likedPosts[postId] ? 'text-rose-600 bg-rose-50 font-semibold' : 'hover:text-rose-500 hover:bg-gray-50'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedPosts[postId] ? 'fill-rose-600 text-rose-600' : ''}`} />
                          <span className="text-xs">{likeCounts[postId] || 0}</span>
                        </button>

                        <button
                          onClick={() => setSelectedPostModal(singlePost)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:text-[#851D52] hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-xs">{commentCount}</span>
                        </button>

                        <button
                          onClick={() => handleShare(postId, singlePost.title)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                /* Empty State */
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 mb-4 rounded-full bg-[#851D52]/10 flex items-center justify-center text-[#851D52]">
                    <Camera className="w-10 h-10" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Share Photos
                  </h3>
                  <p className="text-gray-500 text-base sm:text-lg font-medium">
                    When you share photos, they will appear on your profile.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* --- BURGUNDY & WHITE THEMED COMMENT MODAL --- */}
      <AnimatePresence>
        {selectedPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedPostModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl h-[80vh] sm:h-[85vh] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPostModal(null)}
                className="absolute top-3.5 right-4 z-50 p-2 rounded-full text-gray-500 bg-gray-100 hover:text-gray-800 hover:bg-gray-200 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* LEFT SIDE: Burgundy Gradient Post Details Box (HIDDEN ON MOBILE) */}
              <div className="hidden md:flex md:w-7/12 bg-gradient-to-br from-[#4a0d33] via-[#5E1243] to-[#851D52] p-6 sm:p-8 flex-col justify-between overflow-y-auto text-white">
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#e87163] to-white flex-shrink-0 shadow-md">
                      <img 
                        src={
                          selectedPostModal?.authorId?.profilePicture || 
                          selectedPostModal?.authorId?.profilepicture || 
                          DEFAULT_AVATAR
                        } 
                        alt="Author" 
                        className="w-full h-full rounded-full object-cover border border-white"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base capitalize tracking-wide">
                        {selectedPostModal?.authorId?.firstname || selectedPostModal?.authorId?.firstName || "User"} {selectedPostModal?.authorId?.lastname || selectedPostModal?.authorId?.lastName || ""}
                      </h4>
                      <p className="text-xs text-white/70 font-medium">{moment(selectedPostModal?.createdAt).fromNow()}</p>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug tracking-tight">
                    {selectedPostModal?.title}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed whitespace-pre-line break-words font-normal">
                    {selectedPostModal?.description}
                  </p>
                </div>

                {/* Left Bottom Stats */}
                <div className="pt-6 border-t border-white/15 mt-6 flex items-center gap-4 text-white text-sm font-medium">
                  <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                    <Heart className={`w-4 h-4 ${likedPosts[selectedPostModal._id || selectedPostModal.id] ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                    <span>{likeCounts[selectedPostModal._id || selectedPostModal.id] || 0} Likes</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>{selectedPostModal?.comments?.length || 0} Comments</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Comments Panel (CENTERED HEADING ON MOBILE) */}
              <div className="w-full md:w-5/12 bg-[#F4F7FB] flex flex-col justify-between h-full">
                {/* Header */}
                <div className="px-6 py-3.5 bg-white border-b border-gray-100 flex items-center justify-center relative shadow-sm">
                  <h3 className="font-bold text-[#5E1243] text-base text-center">Comments</h3>
                  <span className="hidden sm:block absolute right-14 text-xs text-gray-400 font-medium">
                    {selectedPostModal?.comments?.length || 0} total
                  </span>
                </div>

                {/* Comments List */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
                  {selectedPostModal?.comments?.length > 0 ? (
                    selectedPostModal.comments.map((comment) => {
                      const cAuthor = comment?.authorId || {}
                      const commentAuthorName = `${cAuthor?.firstname || cAuthor?.firstName || 'User'} ${cAuthor?.lastname || cAuthor?.lastName || ''}`
                      const commentAuthorPic = cAuthor?.profilePicture || cAuthor?.profilepicture || DEFAULT_AVATAR
                      
                      const cLikes = comment?.likes || []
                      const isCommentLiked = cLikes.some(id => String(id?._id || id) === currentUserId)

                      return (
                        <div key={comment._id} className="flex gap-3 items-start bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#851D52]/20 transition-all">
                          <img 
                            src={commentAuthorPic} 
                            alt="Commenter" 
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200 mt-0.5"
                          />
                          <div className="flex-1 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 capitalize text-[13px]">{commentAuthorName}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{moment(comment.createdAt).fromNow()}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed break-words">{comment.content}</p>
                            
                            <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400 font-medium">
                              <span>{cLikes.length} {cLikes.length === 1 ? 'like' : 'likes'}</span>
                            </div>
                          </div>

                          {/* Comment Like Button */}
                          <button
                            onClick={() => handleToggleCommentLike(selectedPostModal._id || selectedPostModal.id, comment._id)}
                            className="p-1.5 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                          >
                            <Heart 
                              className={`w-4 h-4 transition-colors ${isCommentLiked ? 'fill-rose-600 text-rose-600' : 'text-gray-300 hover:text-rose-400'}`} 
                            />
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
                      <div className="w-12 h-12 rounded-full bg-[#851D52]/10 flex items-center justify-center mb-3 text-[#851D52]">
                        <MessageCircle size={22} />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">No comments yet</p>
                      <p className="text-xs text-gray-400 mt-0.5">Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>

                {/* --- BURGUNDY SEND BUTTON & INPUT --- */}
                <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={modalCommentText}
                    onChange={(e) => setModalCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddModalComment(selectedPostModal._id || selectedPostModal.id)}
                    className="flex-1 bg-[#fcf8fa] border-2 border-[#851D52]/40 rounded-full px-5 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#851D52] focus:ring-2 focus:ring-[#851D52]/20 transition-all shadow-inner"
                  />
                  <button
                    onClick={() => handleAddModalComment(selectedPostModal._id || selectedPostModal.id)}
                    disabled={submittingComment}
                    className="w-10 h-10 bg-gradient-to-tr from-[#4a0d33] via-[#851D52] to-[#851D52] text-white rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center flex-shrink-0 shadow-md shadow-[#851D52]/40"
                  >
                    <Send size={18} strokeWidth={2.5} className="ml-0.5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && isOwnProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-1 bg-gradient-to-r from-[#4a0d33] via-[#851D52] to-[#e87163]"></div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-[#5E1243]">Edit Profile</h3>
                  <button
                    onClick={closeEditModal}
                    disabled={savingName}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors outline-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="First name"
                    value={editFirstname}
                    onChange={(e) => set_editFirstname(e.target.value)}
                  />
                  <Input
                    label="Last name"
                    value={editLastname}
                    onChange={(e) => set_editLastname(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeEditModal}
                    disabled={savingName}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={savingName}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5E1243] to-[#9c1f52] text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-[#5E1243]/20 disabled:opacity-60 cursor-pointer"
                  >
                    <Save size={16} strokeWidth={2} />
                    {savingName ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Modal */}
      <AnimatePresence>
        {securityOpen && isOwnProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeSecurityModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-1 bg-gradient-to-r from-[#4a0d33] via-[#851D52] to-[#e87163]"></div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#851D52]" strokeWidth={2} />
                    <h3 className="text-lg font-bold text-[#5E1243]">Security Settings</h3>
                  </div>
                  <button
                    onClick={closeSecurityModal}
                    disabled={savingPassword}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors outline-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-5">Update your account password</p>

                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    placeholder="Enter current password"
                    isPassword
                    value={current_password}
                    onChange={(e) => set_current_password(e.target.value)}
                  />
                  <Input
                    label="New Password"
                    placeholder="Enter new password"
                    isPassword
                    value={new_password}
                    onChange={(e) => set_new_password(e.target.value)}
                  />
                  <Input
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    isPassword
                    value={rep_password}
                    onChange={(e) => set_rep_password(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeSecurityModal}
                    disabled={savingPassword}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updatePassword}
                    disabled={savingPassword}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5E1243] to-[#9c1f52] text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-[#5E1243]/20 disabled:opacity-60 cursor-pointer"
                  >
                    <Save size={16} strokeWidth={2} />
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Post Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-[24px] p-6 text-center shadow-2xl">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Delete this post?</h3>
              <p className="text-xs text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => set_deleteTarget(null)} className="flex-1 py-2 rounded-xl border text-sm">Cancel</button>
                <button onClick={confirmDeletePost} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-[24px] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Edit Post</h3>
                <button onClick={() => set_editTarget(null)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => set_editTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => set_editDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => set_editTarget(null)} className="flex-1 py-2.5 rounded-xl border text-sm">Cancel</button>
                <button onClick={confirmEditPost} className="flex-1 py-2.5 rounded-xl bg-[#851D52] text-white text-sm font-semibold">
                  {savingPost ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile