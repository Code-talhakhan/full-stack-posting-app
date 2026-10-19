import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { baseUrl } from '../core'
import Header from '../component/Header'
import CommentModal from '../component/CommentModal'
import EditPostModal from '../component/EditPostModal'
import DeletePostModal from '../component/DeletePostModal'
import { store } from '../store/states'
import showToast from '../component/CustomToast'
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  MessageSquareOff,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_POST_URL = `${baseUrl}/api/v1/post`
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const SinglePostPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = store()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)

  // Like & Modal States
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [selectedPostModal, setSelectedPostModal] = useState(null)

  // Dropdown & Edit/Delete States
  const [showDropdown, setShowDropdown] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const dropdownRef = useRef(null)

  const currentUserId = String(
    user?.data?.user?._id || user?.user?._id || user?.data?._id || user?._id || ""
  )

  // Outside click handler for dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchSinglePost()
  }, [postId, currentUserId])

  const fetchSinglePost = async () => {
    if (!postId) return
    try {
      setLoading(true)
      setNotFound(false)
      const token = localStorage.getItem("token")

      let postData = null

      try {
        const resp = await axios.get(`${API_POST_URL}/${postId}`, { headers: { token } })
        postData = resp.data?.data || resp.data?.post || resp.data
      } catch (err) {
        // Fallback search in feed API if single endpoint fails
        const allResp = await axios.get(API_POST_URL, { headers: { token } })
        const rawPosts = allResp.data?.data || allResp.data || []
        const allPosts = Array.isArray(rawPosts) ? rawPosts : []
        
        postData = allPosts.find(p => String(p._id || p.id) === String(postId))
      }

      if (!postData || typeof postData !== 'object' || (!postData._id && !postData.id)) {
        setNotFound(true)
        return
      }

      setPost(postData)
      setEditTitle(postData.title || '')
      setEditDescription(postData.description || '')

      if (selectedPostModal) {
        setSelectedPostModal(postData)
      }

      const likesArr = postData.likes || []
      setIsLiked(likesArr.some(lId => String(lId?._id || lId) === currentUserId))
      setLikeCount(likesArr.length || 0)

    } catch (error) {
      console.error("Error fetching single post:", error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  // Back button handling
  const handleBack = () => {
    setIsNavigatingBack(true)
    navigate(-1)
  }

  // Handle Post Like
  const handleLike = async () => {
    if (!currentUserId) {
      showToast.error("Please login first")
      return
    }

    const prevLiked = isLiked
    const prevCount = likeCount

    setIsLiked(!prevLiked)
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      const token = localStorage.getItem("token")
      const resp = await axios.post(`${API_POST_URL}/${postId}/like`, {}, { headers: { token } })
      if (resp.data) {
        setIsLiked(resp.data.liked)
        setLikeCount(resp.data.likesCount)
      }
    } catch (error) {
      setIsLiked(prevLiked)
      setLikeCount(prevCount)
      showToast.error("Failed to update like")
    }
  }

  // Handle Delete Post
  const handleDeletePost = async () => {
    try {
      setDeleting(true)
      const token = localStorage.getItem("token")
      await axios.delete(`${API_POST_URL}/${postId}`, { headers: { token } })
      showToast.success("Post deleted successfully")
      setDeleteOpen(false)
      navigate('/')
    } catch (error) {
      console.error("Delete error:", error)
      showToast.error("Failed to delete post")
    } finally {
      setDeleting(false)
    }
  }

  // Handle Save Edit Post
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      showToast.error("Title and description are required")
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("token")
      const resp = await axios.put(
        `${API_POST_URL}/${postId}`, 
        { title: editTitle, description: editDescription }, 
        { headers: { token } }
      )

      const updatedData = resp.data?.data || resp.data?.post || { ...post, title: editTitle, description: editDescription }
      setPost(updatedData)
      setEditOpen(false)
      showToast.success("Post updated successfully")
    } catch (error) {
      console.error("Edit error:", error)
      showToast.error("Failed to update post")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy Share Link
  const handleShare = async () => {
    try {
      const shareUrl = window.location.href
      await navigator.clipboard.writeText(shareUrl)
      showToast.success("Link copied to clipboard!")
    } catch (err) {
      showToast.error("Failed to copy link")
    }
  }

  if (isNavigatingBack) {
    return (
      <div className="min-h-screen bg-[#F4F7FB]">
        <Header hideSearch={true} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB]">
        <Header hideSearch={true} />
        <div className="max-w-4xl mx-auto px-4 pt-12 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#851D52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] font-sans flex flex-col">
        <Header hideSearch={true} />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 mb-4 rounded-full bg-[#851D52]/10 flex items-center justify-center text-[#851D52]">
            <MessageSquareOff size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-[#851D52] font-semibold hover:underline cursor-pointer"
          >
            Go back to Feed
          </button>
        </main>
      </div>
    )
  }

  // Extract author data safely
  const postAuthor = post?.authorId || post?.user || post?.author || {}
  const authorFirstName = postAuthor?.firstname || postAuthor?.firstName || postAuthor?.name || 'User'
  const authorLastName = postAuthor?.lastname || postAuthor?.lastName || ''
  const authorPic = postAuthor?.profilePicture || postAuthor?.profilepicture || DEFAULT_AVATAR
  const commentsList = post?.comments || []

  // Author ID Match Verification
  const authorIdStr = String(postAuthor?._id || postAuthor?.id || postAuthor || '')
  const isOwner = Boolean(currentUserId && authorIdStr && currentUserId === authorIdStr)

  // Image Fallback
  const postImage = post?.imageUrl 
                 || post?.image 
                 || (typeof post?.files === 'string' ? post?.files : post?.files?.[0]?.url || post?.files?.[0]) 
                 || null;

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header hideSearch={true} />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-[#851D52] font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <Link 
              to={postAuthor?._id ? `/profile/${postAuthor._id}` : "/profile"} 
              className="flex items-center gap-3 group outline-none"
            >
              <div className="w-11 h-11 rounded-full flex-shrink-0 shadow-sm group-hover:shadow-md transition-all overflow-hidden">
                <img src={authorPic} alt="User" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-gray-900 text-[15px] capitalize group-hover:text-[#851D52] transition-colors leading-tight">
                  {authorFirstName} {authorLastName}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{post.createdAt ? moment(post.createdAt).fromNow() : "Recently"}</span>
                </div>
              </div>
            </Link>

            {/* Three Dots Dropdown Menu */}
            {isOwner && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
                  aria-label="Options"
                >
                  <MoreVertical size={20} />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-36 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-gray-100 p-1.5 z-20 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setEditTitle(post.title || '')
                          setEditDescription(post.description || '')
                          setEditOpen(true)
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer font-medium"
                      >
                        <Pencil size={16} className="text-gray-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false)
                          setDeleteOpen(true)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer font-medium"
                      >
                        <Trash2 size={16} className="text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Title, Description & Image Section */}
          <div className="pl-1 mb-4">
            {post.title && <h4 className="font-bold text-gray-900 text-[17px] mb-1.5">{post.title}</h4>}
            <p className="text-gray-600 text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-line break-words mb-3">
              {post.description}
            </p>

            {/* Post Image Container */}
            {postImage && (
              <div className="w-full rounded-[20px] overflow-hidden border border-gray-100 bg-gray-50 shadow-sm my-3 max-h-[420px] flex items-center justify-center">
                <img 
                  src={postImage} 
                  alt="Post Attachment" 
                  className="w-full h-full max-h-[420px] object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-start gap-4 text-gray-700 text-sm font-medium">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                isLiked ? 'text-rose-600 bg-rose-50 font-semibold' : 'hover:text-rose-500 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span className="text-xs">{likeCount}</span>
            </button>

            <button
              onClick={() => setSelectedPostModal(post)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:text-[#851D52] hover:bg-gray-50 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">{commentsList.length}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </main>

      <CommentModal
        selectedPost={selectedPostModal}
        onClose={() => setSelectedPostModal(null)}
        currentUserId={currentUserId}
        likedPosts={{ [postId]: isLiked }}
        likeCounts={{ [postId]: likeCount }}
        onPostUpdated={(updatedPost) => {
          setPost(updatedPost)
          setSelectedPostModal(updatedPost)
        }}
      /> 

      <EditPostModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        onSave={handleSaveEdit}
        saving={isSubmitting}
      />

      <DeletePostModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeletePost}
        deleting={deleting}
      />
    </div>
  )
}

export default SinglePostPage