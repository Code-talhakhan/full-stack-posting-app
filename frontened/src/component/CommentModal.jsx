import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, MessageCircle, Send, Loader2 } from 'lucide-react'
import { baseUrl } from '../core'
import showToast from '../component/CustomToast'

const API_POST_URL = `${baseUrl}/api/v1/post`
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const CommentModal = ({ selectedPost, onClose, currentUserId, onPostUpdated, likedPosts, likeCounts }) => {
  const [modalCommentText, setModalCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentsList, setCommentsList] = useState([])

  // Re-sync local comments list when selectedPost changes
  useEffect(() => {
    if (selectedPost) {
      setCommentsList(selectedPost?.comments || [])
    }
  }, [selectedPost])

  if (!selectedPost) return null

  const postId = selectedPost._id || selectedPost.id
  const postAuthor = selectedPost?.authorId || selectedPost?.user || selectedPost?.author || {}
  const authorName = `${postAuthor?.firstname || postAuthor?.firstName || 'User'} ${postAuthor?.lastname || postAuthor?.lastName || ''}`
  const authorPic = postAuthor?.profilePicture || postAuthor?.profilepicture || DEFAULT_AVATAR

  const postImage = selectedPost?.imageUrl 
                 || selectedPost?.image 
                 || (typeof selectedPost?.files === 'string' ? selectedPost?.files : selectedPost?.files?.[0]) 
                 || null;

  // Optimistic Add Comment
  const handleAddComment = async () => {
    if (!modalCommentText.trim() || submittingComment) return

    const commentContent = modalCommentText.trim()
    setModalCommentText("") // Reset input field instantly

    // Temporary Optimistic Comment
    const tempComment = {
      _id: Date.now().toString(),
      text: commentContent,
      content: commentContent,
      createdAt: new Date().toISOString(),
      author: {
        _id: currentUserId,
        firstname: "You",
        profilePicture: DEFAULT_AVATAR
      },
      likes: []
    }

    const previousComments = [...commentsList]
    setCommentsList(prev => [tempComment, ...prev])

    try {
      setSubmittingComment(true)
      const token = localStorage.getItem("token")
      const cleanToken = token ? token.replace(/^Bearer\s+/i, "").trim() : ""

      const resp = await axios.post(`${API_POST_URL}/${postId}/comment`, {
        text: commentContent
      }, {
        headers: { token: cleanToken }
      })

      const updatedPost = resp.data?.data || resp.data?.post
      if (updatedPost && updatedPost.comments) {
        setCommentsList(updatedPost.comments)
        if (onPostUpdated) onPostUpdated(updatedPost)
      }
      showToast.success("Comment posted")
    } catch (error) {
      console.error("Error adding comment:", error)
      showToast.error(error?.response?.data?.message || "Failed to add comment")
      setCommentsList(previousComments) // Rollback on error
      setModalCommentText(commentContent)
    } finally {
      setSubmittingComment(false)
    }
  }

  // Optimistic Toggle Comment Like
  const handleToggleCommentLike = async (commentId) => {
    if (!currentUserId) {
      showToast.error("Please login first")
      return
    }

    const previousComments = [...commentsList]

    // Optimistic Update
    setCommentsList(prevComments =>
      prevComments.map(comment => {
        if (comment._id === commentId) {
          const likesArr = comment.likes || []
          const hasLiked = likesArr.some(cId => String(cId?._id || cId) === currentUserId)
          const newLikes = hasLiked
            ? likesArr.filter(cId => String(cId?._id || cId) !== currentUserId)
            : [...likesArr, currentUserId]

          return { ...comment, likes: newLikes }
        }
        return comment
      })
    )

    try {
      const token = localStorage.getItem("token")
      const cleanToken = token ? token.replace(/^Bearer\s+/i, "").trim() : ""

      const resp = await axios.post(`${API_POST_URL}/${postId}/comment/${commentId}/like`, {}, {
        headers: { token: cleanToken }
      })

      const updatedPost = resp.data?.data || resp.data?.post
      if (updatedPost && updatedPost.comments) {
        setCommentsList(updatedPost.comments)
        if (onPostUpdated) onPostUpdated(updatedPost)
      }
    } catch (error) {
      console.error("Error liking comment:", error)
      showToast.error("Failed to toggle comment like")
      setCommentsList(previousComments) // Rollback on failure
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
          className="w-full max-w-4xl h-[88vh] sm:h-[82vh] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-4 z-50 p-2 rounded-full text-gray-500 bg-gray-100 hover:text-gray-800 hover:bg-gray-200 transition-all cursor-pointer shadow-sm"
          >
            <X size={18} />
          </button>

          {/* LEFT SIDE: Burgundy Gradient Panel (Desktop Only) */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#4a0d33] via-[#5E1243] to-[#851D52] p-6 flex-col justify-between overflow-hidden text-white h-full">
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Author Info - Frameless Profile Picture */}
              <Link 
                to={postAuthor?._id ? `/profile/${postAuthor._id}` : "/profile"} 
                onClick={onClose}
                className="flex items-center gap-3 mb-3 group cursor-pointer w-fit flex-shrink-0"
              >
                <img 
                  src={authorPic} 
                  alt="Author" 
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 group-hover:scale-105 transition-transform" 
                />
                <div>
                  <h4 className="font-bold text-white text-sm capitalize tracking-wide group-hover:underline">{authorName}</h4>
                  <p className="text-[11px] text-white/70 font-medium">{moment(selectedPost?.createdAt).fromNow()}</p>
                </div>
              </Link>

              {/* Title & Description */}
              <div className="flex-shrink-0 mb-2">
                {selectedPost?.title && (
                  <h2 className="text-lg font-bold text-white leading-snug tracking-tight line-clamp-2">{selectedPost.title}</h2>
                )}
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line break-words font-normal line-clamp-3 mt-1">
                  {selectedPost?.description}
                </p>
              </div>

              {/* Image Frame Container */}
              {postImage && (
                <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/15 bg-black/20 shadow-inner flex items-center justify-center my-2 min-h-0">
                  <img 
                    src={postImage} 
                    alt="Post media" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              )}
            </div>

            {/* Bottom Fixed Stats */}
            <div className="pt-3 border-t border-white/15 mt-2 flex items-center gap-3 text-white text-xs font-medium flex-shrink-0">
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
          <div className="w-full md:w-1/2 bg-[#F4F7FB] flex flex-col justify-between h-full min-h-0">
            {/* Header */}
            <div className="px-6 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between relative shadow-sm flex-shrink-0">
              <h3 className="font-bold text-[#5E1243] text-base">Comments</h3>
              <span className="text-xs text-gray-400 font-medium mr-8 sm:mr-0">{commentsList.length} total</span>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
              {commentsList.length > 0 ? (
                commentsList.map((comment, idx) => {
                  const cAuthor = comment?.authorId || comment?.user || comment?.author || {}
                  const commentAuthorId = cAuthor?._id || cAuthor?.id
                  const commentAuthorName = `${cAuthor?.firstname || cAuthor?.firstName || 'User'} ${cAuthor?.lastname || cAuthor?.lastName || ''}`
                  const commentAuthorPic = cAuthor?.profilePicture || cAuthor?.profilepicture || DEFAULT_AVATAR
                  const cLikes = comment?.likes || []
                  const isCommentLiked = cLikes.some(cId => String(cId?._id || cId) === currentUserId)

                  return (
                    <div key={comment._id || idx} className="flex gap-3 items-start bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                      <Link 
                        to={commentAuthorId ? `/profile/${commentAuthorId}` : "/profile"} 
                        onClick={onClose}
                        className="flex-shrink-0 cursor-pointer"
                      >
                        <img src={commentAuthorPic} alt="Commenter" className="w-8 h-8 rounded-full object-cover mt-0.5 hover:opacity-90 transition-opacity" />
                      </Link>

                      <div className="flex-1 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <Link 
                            to={commentAuthorId ? `/profile/${commentAuthorId}` : "/profile"} 
                            onClick={onClose}
                            className="font-bold text-gray-900 capitalize text-[13px] hover:text-[#851D52] hover:underline transition-colors cursor-pointer"
                          >
                            {commentAuthorName}
                          </Link>
                          <span className="text-[10px] text-gray-400 font-medium">{comment?.createdAt ? moment(comment.createdAt).fromNow() : 'Just now'}</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed break-words">{comment.content || comment.text}</p>
                        
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400 font-medium">
                          <span>{cLikes.length} {cLikes.length === 1 ? 'like' : 'likes'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleCommentLike(comment._id)}
                        className="p-1.5 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isCommentLiked ? 'fill-rose-600 text-rose-600' : 'text-gray-300'}`} />
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
            <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2.5 flex-shrink-0">
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
                disabled={submittingComment || !modalCommentText.trim()}
                className="w-10 h-10 bg-gradient-to-tr from-[#4a0d33] via-[#851D52] to-[#851D52] text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submittingComment ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <Send size={18} strokeWidth={2.5} className="ml-0.5 text-white" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CommentModal