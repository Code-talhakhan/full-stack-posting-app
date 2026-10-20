import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { store } from '../store/states'
import axios from 'axios'
import { baseUrl } from '../core'
import moment from 'moment'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Camera, 
  X, 
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
  User,
  Loader2,
  Link2
} from 'lucide-react'
import Input from "../component/Input"
import Header from "../component/Header"
import CommentModal from "../component/CommentModal"
import EditPostModal from "../component/EditPostModal"
import DeletePostModal from "../component/DeletePostModal"
import showToast from '../component/CustomToast'

const API_POST_URL = `${baseUrl}/api/v1/post`
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

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

      if (selectedPostModal) {
        const updatedTarget = filtered.find(p => (p._id || p.id) === (selectedPostModal._id || selectedPostModal.id))
        if (updatedTarget) setSelectedPostModal(updatedTarget)
      }

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
      showToast.error("Failed to load profile data")
    } finally {
      setLoadingProfile(false)
      setLoadingPosts(false)
    }
  }

  const displayData = isOwnProfile ? loggedInUserData : (viewUser || {})

  const defaultFirstName = displayData?.firstname || displayData?.firstName || displayData?.name || "User"
  const defaultLastName = displayData?.lastname || displayData?.lastName || ""
  const defaultEmail = displayData?.email || "Email not found"
  const defaultBio = displayData?.bio || ""
  const defaultPostCount = userPosts.length
  const memberSince = displayData?.createdAt 
    ? new Date(displayData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : "Recently"

  // Helper function to render bio with Link2 Icon for URLs
  const renderBioWithLinks = (bioText) => {
    if (!bioText) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    return bioText.split('\n').map((line, lineIdx) => (
      <React.Fragment key={lineIdx}>
        {line.split(' ').map((word, wordIdx) => {
          if (word.match(urlRegex)) {
            const href = word.startsWith('http') ? word : `https://${word}`;
            return (
              <a
                key={wordIdx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#851D52] hover:underline font-semibold cursor-pointer align-baseline"
                onClick={(e) => e.stopPropagation()}
              >
                <Link2 size={14} className="inline-block flex-shrink-0" />
                <span>{word}</span>{' '}
              </a>
            );
          }
          return word + ' ';
        })}
        <br />
      </React.Fragment>
    ));
  };

  // Modal States
  const [editOpen, set_editOpen] = useState(false)
  const [securityOpen, set_securityOpen] = useState(false)

  const [editFirstname, set_editFirstname] = useState("")
  const [editLastname, set_editLastname] = useState("")
  const [editBio, set_editBio] = useState("")
  const [savingName, set_savingName] = useState(false)

  const openEditModal = () => {
    set_editFirstname(defaultFirstName !== "User" ? defaultFirstName : "")
    set_editLastname(defaultLastName)
    set_editBio(defaultBio)
    set_editOpen(true)
  }

  const closeEditModal = () => {
    if (savingName) return
    set_editOpen(false)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    set_deleteTarget(null)
  }

  const saveProfile = async () => {
    if (!editFirstname.trim()) {
      showToast.error("First name is required")
      return
    }

    try {
      set_savingName(true)
      await axios.put(`${baseUrl}/api/v1/profile`, {
        firstname: editFirstname,
        lastname: editLastname,
        bio: editBio,
      }, {
        headers: { token: localStorage.getItem("token") }
      })

      global_login({
        ...user,
        data: {
          ...loggedInUserData,
          firstname: editFirstname,
          lastname: editLastname,
          bio: editBio,
        }
      })

      showToast.success("Profile updated")
      set_editOpen(false)
      fetchProfileAndPosts()
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to update profile")
    } finally {
      set_savingName(false)
    }
  }

  // Security Password Handler
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
    if (!current_password) return showToast.error("Current password is required")
    if (!new_password) return showToast.error("New password is required")
    if (new_password.length < 8) return showToast.error("New password must be at least 8 characters long")
    if (rep_password !== new_password) return showToast.error("Passwords do not match")

    try {
      set_savingPassword(true)
      await axios.put(`${baseUrl}/api/v1/password`, {
        currentPassword: current_password,
        newPassword: new_password,
      }, {
        headers: { token: localStorage.getItem("token") }
      })

      showToast.success("Password updated")
      closeSecurityModal()
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to update password")
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

      showToast.success("Profile picture updated")
      fetchProfileAndPosts()
    } catch (error) {
      showToast.error(error?.response?.data?.message || "Failed to upload picture")
    } finally {
      set_uploading(false)
    }
  }

  // Like Toggle
  const handleLike = async (postId) => {
    if (!currentUserId) {
      showToast.error("Please login first")
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
      showToast.error("Failed to update like status")
    }
  }

  // Share Handler
  const handleShare = async (postId) => {
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
      showToast.success("Link copied to clipboard!")
    } catch (err) {
      showToast.error("Failed to copy link")
    }
  }

  // Delete Post Handler
  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      set_deleting(true)
      const token = localStorage.getItem("token")
      await axios.delete(`${API_POST_URL}/${deleteTarget}`, { headers: { token } })
      showToast.success("Post deleted")
      set_deleteTarget(null)
      fetchProfileAndPosts()
    } catch (error) {
      showToast.error("Failed to delete post")
    } finally {
      set_deleting(false)
    }
  }

  const confirmEditPost = async () => {
    if (!editTarget || !editTitle.trim() || !editDescription.trim()) {
      showToast.error("Title and description are required")
      return
    }

    try {
      set_savingPost(true)
      const token = localStorage.getItem("token")
      await axios.put(`${API_POST_URL}/${editTarget}`, {
        title: editTitle,
        description: editDescription
      }, { headers: { token } })

      showToast.success("Post updated")
      set_editTarget(null)
      fetchProfileAndPosts()
    } catch (error) {
      showToast.error("Failed to update post")
    } finally {
      set_savingPost(false)
    }
  }

  if (loadingProfile && !viewUser) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20 flex flex-col">
        <Header hideSearch={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#851D52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header hideSearch={true} />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8">
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

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8 flex flex-col gap-6 mb-6"
        >
          {/* Top Section: Avatar & User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <img
                src={displayData?.profilePicture || displayData?.profilepicture || DEFAULT_AVATAR}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover bg-white"
              />

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

            <div className="flex flex-col items-center sm:items-start flex-1 w-full mt-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-0.5 capitalize">
                {defaultFirstName} {defaultLastName}
              </h3>

              {/* Subtle Gray Email */}
              <p className="text-gray-500 font-medium text-xs sm:text-sm mb-2">{defaultEmail}</p>

              {/* INSTA-STYLE BIO WITH LINK ICON */}
              {defaultBio && (
                <div className="my-1.5 max-w-md w-full text-center sm:text-left">
                  <p className="text-sm font-normal text-gray-700 leading-relaxed tracking-normal">
                    {renderBioWithLinks(defaultBio)}
                  </p>
                </div>
              )}

              {uploading && (
                <p className="text-xs text-gray-400 mb-2">Uploading photo...</p>
              )}
            </div>
          </div>

          {/* Bottom Section: INSTAGRAM-STYLE FULL WIDTH BUTTONS ROW */}
          {isOwnProfile && (
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={openEditModal}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-800 font-semibold text-sm transition-all cursor-pointer text-center"
              >
                Edit Profile
              </button>
              <button
                onClick={() => set_securityOpen(true)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-800 font-semibold text-sm transition-all cursor-pointer text-center"
              >
                Security
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        <div className="flex justify-center mb-8">
          <div className="w-[96%] border-t border-gray-200/70"></div>
        </div>

        <div className="flex items-center gap-2.5 mb-6 px-1">
          <div className="h-7 w-2 bg-gradient-to-b from-[#4a0d33] via-[#851D52] to-[#e87163] rounded-full"></div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
            {isOwnProfile ? "Your Posts" : `${defaultFirstName}'s Posts`}
          </h3>
        </div>

        {/* User Posts List */}
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

                  const postImage = singlePost?.imageUrl 
                                 || singlePost?.image 
                                 || (typeof singlePost?.files === 'string' ? singlePost?.files : singlePost?.files?.[0]) 
                                 || null;

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
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={displayData?.profilePicture || displayData?.profilepicture || DEFAULT_AVATAR} 
                            alt="User" 
                            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                          />
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

                      {/* Clickable Content Wrapper */}
                      <div 
                        onClick={() => navigate(`/post/${postId}`)}
                        className="cursor-pointer group"
                      >
                        {/* Content Section */}
                        <div className="mb-3">
                          <h4 className="font-bold text-gray-900 text-[17px] mb-1 group-hover:text-[#851D52] transition-colors">
                            {singlePost.title}
                          </h4>
                          <p className="text-gray-600 text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-line break-words">
                            {singlePost.description}
                          </p>
                        </div>

                        {/* Image Frame */}
                        {postImage && (
                          <div className="w-full rounded-[18px] overflow-hidden border border-gray-100 bg-black/5 my-3">
                            <img 
                              src={postImage} 
                              alt="Post Attachment" 
                              className="w-full max-h-[460px] object-cover rounded-[18px] group-hover:scale-[1.005] transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}
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
                          onClick={() => handleShare(postId)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
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

      {/* REUSABLE COMMENT MODAL */}
      <CommentModal
        selectedPost={selectedPostModal}
        onClose={() => setSelectedPostModal(null)}
        currentUserId={currentUserId}
        likedPosts={likedPosts}
        likeCounts={likeCounts}
        onPostUpdated={(updatedPost) => {
          setSelectedPostModal(updatedPost)
          fetchProfileAndPosts()
        }}
      />

      {/* REUSABLE EDIT POST MODAL */}
      <EditPostModal
        isOpen={Boolean(editTarget)}
        onClose={() => set_editTarget(null)}
        editTitle={editTitle}
        setEditTitle={set_editTitle}
        editDescription={editDescription}
        setEditDescription={set_editDescription}
        onSave={confirmEditPost}
        saving={savingPost}
      />

      {/* REUSABLE DELETE POST MODAL */}
      <DeletePostModal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        deleting={deleting}
      />

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editOpen && isOwnProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 relative"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#851D52]/10 flex items-center justify-center text-[#851D52]">
                    <User size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4a0d33] tracking-tight">
                      Edit Profile
                    </h3>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">
                      Update your personal information
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeEditModal}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
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

                {/* Bio Input Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-700">Bio</label>
                    <span className="text-[10px] text-gray-400 font-medium">{editBio.length}/250</span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={250}
                    value={editBio}
                    onChange={(e) => set_editBio(e.target.value)}
                    placeholder="Tell something about yourself... (Press Enter for line breaks)"
                    className="w-full bg-[#fcf8fa] border-2 border-gray-200 rounded-2xl p-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#851D52] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-7">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingName}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingName}
                  className="flex-1 py-3 rounded-2xl bg-[#851D52] hover:bg-[#721845] active:scale-[0.99] text-white text-sm font-semibold transition-all shadow-md shadow-[#851D52]/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {savingName ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={closeSecurityModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 relative"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#851D52]/10 flex items-center justify-center text-[#851D52]">
                    <ShieldCheck size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4a0d33] tracking-tight">
                      Security Settings
                    </h3>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">
                      Update your account password
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeSecurityModal}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <Input 
                  label="Current Password" 
                  isPassword 
                  value={current_password} 
                  onChange={(e) => set_current_password(e.target.value)} 
                />

                <Input 
                  label="New Password" 
                  isPassword 
                  value={new_password} 
                  onChange={(e) => set_new_password(e.target.value)} 
                />
                
                <Input 
                  label="Confirm New Password" 
                  isPassword 
                  value={rep_password} 
                  onChange={(e) => set_rep_password(e.target.value)} 
                />
              </div>

              <div className="flex items-center gap-3 mt-7">
                <button
                  type="button"
                  onClick={closeSecurityModal}
                  disabled={savingPassword}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={updatePassword}
                  disabled={savingPassword}
                  className="flex-1 py-3 rounded-2xl bg-[#851D52] hover:bg-[#721845] active:scale-[0.99] text-white text-sm font-semibold transition-all shadow-md shadow-[#851D52]/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile