import React, { useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { X, Heart, MessageCircle, Send } from 'lucide-react'
import { baseUrl } from '../core'

const API_POST_URL = `${baseUrl}/api/v1/post`
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const CommentModal = ({ selectedPost, onClose, currentUserId, onPostUpdated, likedPosts, likeCounts }) => {
  const [modalCommentText, setModalCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  if (!selectedPost) return null

  const postId = selectedPost._id || selectedPost.id
  const postAuthor = selectedPost?.authorId || selectedPost?.user || selectedPost?.author || {}
  const authorName = `${postAuthor?.firstname || postAuthor?.firstName || 'User'} ${postAuthor?.lastname || postAuthor?.lastName || ''}`
  const authorPic = postAuthor?.profilePicture || postAuthor?.profilepicture || DEFAULT_AVATAR
  const commentsList = selectedPost?.comments || []

  // Extract Image URL with fallbacks
  const postImage = selectedPost?.imageUrl 
                 || selectedPost?.image 
                 || (typeof selectedPost?.files === 'string' ? selectedPost?.files : selectedPost?.files?.[0]) 
                 || null;

  // Add Comment API Call
  const handleAddComment = async () => {
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
        setModalCommentText("")
        toast.success("Comment posted")
        if (onPostUpdated) onPostUpdated(resp.data.data)
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Toggle Comment Like API Call
  const handleToggleCommentLike = async (commentId) => {
    if (!currentUserId) {
      toast.error("Please login first")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const resp = await axios.post(`${API_POST_URL}/${postId}/comment/${commentId}/like`, {}, {
        headers: { token }
      })

      if (resp.data?.data && onPostUpdated) {
        onPostUpdated(resp.data.data)
      }
    } catch (error) {
      console.error("Error liking comment:", error)
      toast.error("Failed to toggle comment like")
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl h-[85vh] sm:h-[82vh] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-4 z-50 p-2 rounded-full text-gray-500 bg-gray-100 hover:text-gray-800 hover:bg-gray-200 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* LEFT SIDE: Burgundy Gradient Panel (Fixed Layout - No Panel Shift) */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#4a0d33] via-[#5E1243] to-[#851D52] p-6 flex-col justify-between overflow-hidden text-white h-full">
            
            {/* Middle Scrollable Section (Sirf Post Content Scroll Hoga) */}
            <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={authorPic} 
                  alt="Author" 
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/20 shadow-sm" 
                />
                <div>
                  <h4 className="font-bold text-white text-sm capitalize tracking-wide">{authorName}</h4>
                  <p className="text-[11px] text-white/70 font-medium">{moment(selectedPost?.createdAt).fromNow()}</p>
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg font-bold text-white mb-2 leading-snug tracking-tight">{selectedPost?.title}</h2>
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line break-words font-normal mb-4">{selectedPost?.description}</p>

              {/* Image Frame Container */}
              {postImage && (
                <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-black/20 shadow-inner max-h-[280px] flex items-center justify-center my-2">
                  <img 
                    src={postImage} 
                    alt="Post media" 
                    className="w-full h-full max-h-[280px] object-cover"
                  />
                </div>
              )}
            </div>

            {/* Bottom Fixed Stats (Ab bilkul hilay ga nahi) */}
            <div className="pt-4 border-t border-white/15 mt-3 flex items-center gap-3 text-white text-xs font-medium flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                <Heart className={`w-3.5 h-3.5 ${likedPosts?.[postId] ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                <span>{likeCounts?.[postId] || 0} Likes</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
                <span>{commentsList.length} Comments</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Comments Panel */}
          <div className="w-full md:w-1/2 bg-[#F4F7FB] flex flex-col justify-between h-full">
            {/* Header */}
            <div className="px-6 py-3.5 bg-white border-b border-gray-100 flex items-center justify-center relative shadow-sm">
              <h3 className="font-bold text-[#5E1243] text-base text-center">Comments</h3>
              <span className="hidden sm:block absolute right-14 text-xs text-gray-400 font-medium">{commentsList.length} total</span>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
              {commentsList.length > 0 ? (
                commentsList.map((comment) => {
                  const cAuthor = comment?.authorId || {}
                  const commentAuthorName = `${cAuthor?.firstname || cAuthor?.firstName || 'User'} ${cAuthor?.lastname || cAuthor?.lastName || ''}`
                  const commentAuthorPic = cAuthor?.profilePicture || cAuthor?.profilepicture || DEFAULT_AVATAR
                  const cLikes = comment?.likes || []
                  const isCommentLiked = cLikes.some(cId => String(cId?._id || cId) === currentUserId)

                  return (
                    <div key={comment._id} className="flex gap-3 items-start bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                      <img src={commentAuthorPic} alt="Commenter" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
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

                      <button
                        onClick={() => handleToggleCommentLike(comment._id)}
                        className="p-1.5 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${isCommentLiked ? 'fill-rose-600 text-rose-600' : 'text-gray-300'}`} />
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

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2.5">
              <input
                type="text"
                placeholder="Add a comment..."
                value={modalCommentText}
                onChange={(e) => setModalCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-[#fcf8fa] border-2 border-[#851D52]/40 rounded-full px-5 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#851D52]"
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment}
                className="w-10 h-10 bg-gradient-to-tr from-[#4a0d33] via-[#851D52] to-[#851D52] text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer"
              >
                <Send size={18} strokeWidth={2.5} className="ml-0.5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CommentModal