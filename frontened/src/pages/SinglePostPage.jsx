import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { baseUrl } from '../core'
import Header from '../component/Header'
import CommentModal from '../component/CommentModal'
import { store } from '../store/states'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  MessageSquareOff 
} from 'lucide-react'
import { motion } from 'framer-motion'

const API_POST_URL = `${baseUrl}/api/v1/post`
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const SinglePostPage = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = store()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Like & Modal States
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [selectedPostModal, setSelectedPostModal] = useState(null)

  const currentUserId = String(
    user?.data?.user?._id || user?.user?._id || user?.data?._id || user?._id || ""
  )

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
        postData = resp.data?.data || resp.data
      } catch (err) {
        const allResp = await axios.get(API_POST_URL, { headers: { token } })
        const allPosts = allResp.data?.data || []
        postData = allPosts.find(p => String(p._id || p.id) === String(postId))
      }

      if (!postData) {
        setNotFound(true)
        return
      }

      setPost(postData)

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

  // Handle Post Like
  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please login first")
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
      toast.error("Failed to update like")
    }
  }

  // Copy Share Link
  const handleShare = async () => {
    try {
      const shareUrl = window.location.href
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 pt-12 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#851D52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] font-sans flex flex-col">
        <Header />
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

  const postAuthor = post?.authorId || post?.user || post?.author || {}
  const authorFirstName = postAuthor?.firstname || postAuthor?.firstName || postAuthor?.name || 'User'
  const authorLastName = postAuthor?.lastname || postAuthor?.lastName || ''
  const authorPic = postAuthor?.profilePicture || postAuthor?.profilepicture || DEFAULT_AVATAR
  const commentsList = post?.comments || []

  // Extract Post Image with Fallbacks
  const postImage = post?.imageUrl 
                 || post?.image 
                 || (typeof post?.files === 'string' ? post?.files : post?.files?.[0]) 
                 || null;

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-[#851D52] font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-[#851D52]/20 transition-all duration-300 relative"
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
          </div>

          {/* Title, Description & Image Section */}
          <div className="pl-1 mb-4">
            <h4 className="font-bold text-gray-900 text-[17px] mb-1.5">{post.title}</h4>
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
    </div>
  )
}

export default SinglePostPage