import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Form from '../component/form'
import axios from 'axios'
import moment from "moment"
import { Edit2, Trash2, Clock, MessageSquareOff, X, AlertTriangle, Save, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Header from "../component/Header"
import { store } from '../store/states'

const API_URL = "http://localhost:3001/api/v1/post"
const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const Post = () => {
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

 
  const robustUser = user?.data?.user || user?.user || user?.data || user || {};
  const currentUserId = String(robustUser?._id || robustUser?.id || "");

  useEffect(() => {
    getAllPosts()
  }, [])

  const getAllPosts = async () => {
    try {
      set_loading(true)
      const token = localStorage.getItem("token") 

      const resp = await axios.get(API_URL, {
        headers: { token: token } 
      })
      set_posts(resp.data.data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      set_loading(false)
    }
  }

  const openDeleteModal = (postId) => {
    if (!postId) {
      toast.error("Post id is required")
      return
    }
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
      const token = localStorage.getItem("token") 

      await axios.delete(`${API_URL}/${deleteTarget}`, {
        headers: { token: token } 
      })
      
      toast.success("Post deleted", {
        style: {
          background: 'linear-gradient(to bottom right, #4a0d33, #851D52, #e87163)',
          color: '#ffffff',
          border: 'none',
        },
      })
      set_deleteTarget(null)
      getAllPosts() 
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    } finally {
      set_deleting(false)
    }
  }

  const openEditModal = (postId, title, description) => {
    if (!postId) {
      toast.error("Post id is required")
      return
    }
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
      const token = localStorage.getItem("token") 

      await axios.put(`${API_URL}/${editTarget}`, {
        title: editTitle,
        description: editDescription
      }, {
        headers: { token: token } 
      })
      
      toast.success("Post updated", {
        style: {
          background: 'linear-gradient(to bottom right, #4a0d33, #851D52, #e87163)',
          color: '#ffffff',
          border: 'none',
        },
      })
      closeEditModal()
      getAllPosts() 
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    } finally {
      set_saving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8">
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
              <div
                key={i}
                className="bg-white p-5 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0"></div>
                  <div className="flex-1 space-y-3 mt-1">
                    <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-1/6"></div>
                    <div className="h-4 bg-gray-100 rounded-full w-1/3 mt-4"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-2/3"></div>
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
                  
                  // 👇 Author ki ID ko string mein convert kiya taake comparison 100% theek ho
                  const postAuthorId = String(postAuthor?._id || postAuthor?.id || (typeof postAuthor === 'string' ? postAuthor : ""));
                  
                  const isMyPost = currentUserId && postAuthorId && currentUserId === postAuthorId;

                  const firstName = postAuthor?.firstname || postAuthor?.firstName || postAuthor?.name || "User"
                  const lastName = postAuthor?.lastname || postAuthor?.lastName || ""
                  
                 
                  const profilePic = postAuthor?.profilePicture 
                                  || postAuthor?.profilepicture 
                                  || (isMyPost ? (robustUser?.profilePicture || robustUser?.profilepicture) : null) 
                                  || DEFAULT_AVATAR

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                      key={postId}
                      className="bg-white p-5 sm:p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-[#851D52]/20 hover:shadow-[0_8px_30px_rgba(133,29,82,0.08)] transition-all duration-300 relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Link 
                          to={postAuthor?._id ? `/profile/${postAuthor._id}` : "/profile"} 
                          className="flex items-center gap-3 group outline-none"
                        >
                          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163] flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                            <img 
                              src={profilePic} 
                              alt="User" 
                              className="w-full h-full rounded-full object-cover border border-white"
                            />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-bold text-gray-900 text-[15px] capitalize group-hover:text-[#851D52] transition-colors leading-tight">
                              {firstName} {lastName}
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
                                  <div 
                                    className="fixed inset-0 z-30" 
                                    onClick={() => setActiveDropdown(null)}
                                  ></div>
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, transformOrigin: "top right" }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] border border-gray-100 z-40 py-1 overflow-hidden"
                                  >
                                    <button
                                      onClick={() => {
                                        openEditModal(postId, singlePost.title, singlePost.description)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] text-gray-700 hover:bg-[#fdfafb] hover:text-[#851D52] transition-colors outline-none cursor-pointer"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        openDeleteModal(postId)
                                        setActiveDropdown(null)
                                      }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] text-red-500 hover:bg-red-50 transition-colors outline-none cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      <div className="pl-1">
                        <h4 className="font-bold text-gray-900 text-[17px] mb-1.5">{singlePost.title}</h4>
                        <p className="text-gray-600 text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-line break-words">
                          {singlePost.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-white/50"
                >
                  <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-[#4a0d33]/10 via-[#851D52]/10 to-[#e87163]/10 flex items-center justify-center">
                    <MessageSquareOff className="w-10 h-10 text-[#851D52]/50" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">No posts on your feed</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first one to share something!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-500" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this post?</h3>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-red-500/20 disabled:opacity-60 cursor-pointer"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTarget && (
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
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-1 bg-gradient-to-r from-[#4a0d33] via-[#851D52] to-[#e87163]"></div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-[#5E1243]">Edit Post</h3>
                  <button
                    onClick={closeEditModal}
                    disabled={saving}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors outline-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[12px] font-medium text-gray-500 ml-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => set_editTitle(e.target.value)}
                      className="w-full py-2.5 px-4 bg-[#fdfafb] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/50 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[12px] font-medium text-gray-500 ml-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => set_editDescription(e.target.value)}
                      rows={4}
                      className="w-full py-2.5 px-4 bg-[#fdfafb] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/50 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeEditModal}
                    disabled={saving}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEdit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5E1243] to-[#9c1f52] text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-[#5E1243]/20 disabled:opacity-60 cursor-pointer"
                  >
                    <Save size={16} strokeWidth={2} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Post