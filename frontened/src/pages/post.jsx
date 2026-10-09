import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Form from '../component/form'
import axios from 'axios'
import moment from "moment"
import { 
  Edit2, 
  Trash2, 
  Clock, 
  MessageSquareOff, 
  X, 
  AlertTriangle, 
  MoreVertical,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Header from "../component/Header"
import CommentModal from "../component/CommentModal"
import { store } from '../store/states'

const API_URL = "http://localhost:3001/api/v1/post"
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const Post = () => {
  const navigate = useNavigate()
  const { user } = store()
  const [posts, set_posts] = useState([])
  const [loading, set_loading] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const [deleteTarget, set_deleteTarget] = useState(null)
  const [deleting, set_deleting] = useState(false)

  const [editTarget, set_editTarget] = useState(null)
  const [editTitle, set_editTitle] = useState("")
  const [editDescription, set_editDescription] = useState("")
  const [saving, set_saving] = useState(false)

  const [likedPosts, setLikedPosts] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [selectedPostModal, setSelectedPostModal] = useState(null)

  const robustUser = user?.data?.user || user?.user || user?.data || user || {};
  const currentUserId = String(robustUser?._id || robustUser?.id || "");

  useEffect(() => {
    getAllPosts()
  }, [currentUserId])

  const getAuthHeaders = () => {
    const rawToken = localStorage.getItem("token") || ""
    const cleanToken = rawToken.replace(/^Bearer\s+/i, "").trim()
    return {
      token: cleanToken,
      Authorization: `Bearer ${cleanToken}`
    }
  }

  const getAllPosts = async () => {
    try {
      set_loading(true)
      const resp = await axios.get(API_URL, {
        headers: getAuthHeaders() 
      })
      const fetchedPosts = resp.data.data || []
      set_posts(fetchedPosts)

      if (selectedPostModal) {
        const updatedTarget = fetchedPosts.find(p => (p._id || p.id) === (selectedPostModal._id || selectedPostModal.id))
        if (updatedTarget) setSelectedPostModal(updatedTarget)
      }

      const initialLikes = {}
      const initialCounts = {}
      fetchedPosts.forEach(post => {
        const pId = post._id || post.id
        const likesArr = post.likes || []
        
        initialLikes[pId] = likesArr.some(id => String(id?._id || id) === currentUserId)
        initialCounts[pId] = likesArr.length || 0
      })
      setLikedPosts(initialLikes)
      setLikeCounts(initialCounts)

    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      set_loading(false)
    }
  }

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
      const resp = await axios.post(`${API_URL}/${postId}/like`, {}, {
        headers: getAuthHeaders()
      })

      if (resp.data) {
        setLikedPosts(prev => ({ ...prev, [postId]: resp.data.liked }))
        setLikeCounts(prev => ({ ...prev, [postId]: resp.data.likesCount }))
      }
    } catch (error) {
      setLikedPosts(prev => ({ ...prev, [postId]: isCurrentlyLiked }))
      setLikeCounts(prev => ({ ...prev, [postId]: currentCount }))
      toast.error("Failed to update like status")
    }
  }

  const handleShare = async (postId) => {
    try {
      const shareUrl = `${window.location.origin}/post/${postId}`
      
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

      toast.success("Link copied to clipboard!", {
        style: {
          background: 'linear-gradient(to bottom right, #4a0d33, #851D52, #e87163)',
          color: '#ffffff',
          border: 'none',
        },
      })
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const openDeleteModal = (postId) => {
    if (!postId) return
    set_deleteTarget(postId)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    set_deleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      set_deleting(true)
      const resp = await axios.delete(`${API_URL}/${deleteTarget}`, {
        headers: getAuthHeaders()
      })
      
      toast.success(resp?.data?.message || "Post deleted")
      set_deleteTarget(null)
      getAllPosts() 
    } catch (error) {
      console.error("Delete Error:", error?.response?.data || error)
      toast.error(error?.response?.data?.message || "Failed to delete post")
    } finally {
      set_deleting(false)
    }
  }

  const openEditModal = (postId, title, description) => {
    if (!postId) return
    set_editTarget(postId)
    set_editTitle(title || "")
    set_editDescription(description || "")
  }

  const closeEditModal = () => {
    if (saving) return
    set_editTarget(null)
    set_editTitle("")
    set_editDescription("")
  }

  const confirmEdit = async () => {
    if (!editTarget) return

    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error("Title and description are required")
      return
    }

    try {
      set_saving(true)
      const resp = await axios.put(`${API_URL}/${editTarget}`, {
        title: editTitle.trim(),
        description: editDescription.trim()
      }, {
        headers: getAuthHeaders()
      })
      
      toast.success(resp?.data?.message || "Post updated")
      closeEditModal()
      getAllPosts() 
    } catch (error) {
      console.error("Edit Error:", error?.response?.data || error)
      toast.error(error?.response?.data?.message || "Failed to update post")
    } finally {
      set_saving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header />

      {/* Main Container width updated from max-w-4xl to max-w-2xl */}
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        <Form getAllPosts={getAllPosts} />

        <div className="flex items-center justify-between mb-6 pl-2">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 bg-gradient-to-b from-[#4a0d33] to-[#e87163] rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Your Feed</h3>
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0"></div>
                  <div className="flex-1 space-y-3 mt-1">
                    <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-1/6"></div>
                    <div className="h-4 bg-gray-100 rounded-full w-1/3 mt-4"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {posts.length ? (
                posts.map((singlePost, index) => {
                  const postId = singlePost._id || singlePost.id
                  const postDate = singlePost.updatedAt || singlePost.createdAt
                  
                  const postAuthor = singlePost?.authorId || singlePost?.user || singlePost?.author || {}
                  const postAuthorId = String(postAuthor?._id || postAuthor?.id || (typeof postAuthor === 'string' ? postAuthor : ""));
                  const isMyPost = currentUserId && postAuthorId && currentUserId === postAuthorId;

                  const firstName = postAuthor?.firstName || postAuthor?.firstname || postAuthor?.name || ""
                  const lastName = postAuthor?.lastName || postAuthor?.lastname || ""
                  const fullName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : "User"
                  
                  const profilePic = postAuthor?.profilePicture 
                                  || postAuthor?.profilepicture 
                                  || postAuthor?.profilePic
                                  || (isMyPost ? (robustUser?.profilePicture || robustUser?.profilepicture) : null) 
                                  || DEFAULT_AVATAR

                  const postImage = singlePost?.imageUrl 
                                 || singlePost?.image 
                                 || (typeof singlePost?.files === 'string' ? singlePost?.files : singlePost?.files?.[0]) 
                                 || null

                  const commentCount = singlePost?.comments?.length || 0

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                      key={postId}
                      className="bg-white p-4 sm:p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-[#851D52]/20 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-3">
                        <Link 
                          to={postAuthor?._id ? `/profile/${postAuthor._id}` : "/profile"} 
                          className="flex items-center gap-3 group outline-none"
                        >
                          <img 
                            src={profilePic} 
                            alt="User Profile" 
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover flex-shrink-0" 
                          />
                          <div className="flex flex-col">
                            <h4 className="font-bold text-gray-900 text-[15px] capitalize group-hover:text-[#851D52] transition-colors leading-tight">
                              {fullName}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{postDate ? moment(postDate).fromNow() : "Recently"}</span>
                            </div>
                          </div>
                        </Link>

                        {isMyPost && (
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
                                        openEditModal(postId, singlePost.title, singlePost.description)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] text-gray-700 hover:bg-[#fdfafb] hover:text-[#851D52] transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        openDeleteModal(postId)
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

                      {/* Post Body */}
                      <div 
                        onClick={() => navigate(`/post/${postId}`)}
                        className="cursor-pointer"
                      >
                        <h4 className="font-bold text-gray-900 text-[16px] mb-1">
                          {singlePost.title}
                        </h4>
                        <p className="text-gray-600 text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-line break-words mb-3">
                          {singlePost.description}
                        </p>

                        {/* Optimized Compact Image Container */}
                       {postImage && (
  <div className="w-full rounded-[16px] overflow-hidden border border-gray-100 bg-gray-950/5 shadow-sm my-3 flex items-center justify-center max-h-[450px]">
    <img 
      src={postImage} 
      alt="Post Media" 
      className="w-full max-h-[450px] object-cover rounded-[16px] hover:scale-[1.01] transition-transform duration-300"
      loading="lazy"
    />
  </div>
)}
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="pt-2.5 mt-1 border-t border-gray-100 flex items-center justify-start gap-4 text-gray-700 text-sm font-medium">
                        <button
                          onClick={() => handleLike(postId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                            likedPosts[postId] ? 'text-rose-600 bg-rose-50 font-semibold' : 'hover:text-rose-500 hover:bg-gray-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${likedPosts[postId] ? 'fill-rose-600 text-rose-600' : ''}`} />
                          <span className="text-xs sm:text-sm">{likeCounts[postId] || 0}</span>
                        </button>

                        <button
                          onClick={() => setSelectedPostModal(singlePost)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-[#851D52] hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm">{commentCount}</span>
                        </button>

                        <button
                          onClick={() => handleShare(postId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-white/50">
                  <div className="w-20 h-20 mb-4 rounded-full bg-[#851D52]/10 flex items-center justify-center">
                    <MessageSquareOff className="w-10 h-10 text-[#851D52]/50" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">No posts on your feed</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first one to share something!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Reusable Comment Modal */}
      <CommentModal
        selectedPost={selectedPostModal}
        onClose={() => setSelectedPostModal(null)}
        currentUserId={currentUserId}
        likedPosts={likedPosts}
        likeCounts={likeCounts}
        onPostUpdated={(updatedPost) => {
          setSelectedPostModal(updatedPost)
          getAllPosts()
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-[24px] p-6 text-center shadow-2xl">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this post?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={closeDeleteModal} disabled={deleting} className="flex-1 py-2.5 rounded-xl border text-sm">Cancel</button>
                <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-[24px] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Edit Post</h3>
                <button onClick={closeEditModal}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => set_editTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm"
                  placeholder="Post Title"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => set_editDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm resize-none"
                  placeholder="Post Description"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeEditModal} disabled={saving} className="flex-1 py-2.5 rounded-xl border text-sm">Cancel</button>
                <button onClick={confirmEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#851D52] text-white text-sm font-semibold">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Post