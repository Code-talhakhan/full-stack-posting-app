import React, { useEffect, useState } from 'react'
import Form from '../component/form'
import axios from 'axios'
import moment from "moment"
import { Edit2, Trash2, Clock } from 'lucide-react'

const API_URL = "http://localhost:3001/api/v1/post"

const App = () => {
  const [posts, set_posts] = useState([])
 
  useEffect(() => {
    getAllPosts()
  }, [])

  const getAllPosts = async () => {
    try {
      const resp = await axios.get(API_URL)                   
      set_posts(resp.data.data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

  const delete_post = async (postId) => {
    if (!postId) {
      alert("post id is required")
      return
    }

    if (!window.confirm("Are you sure you want to delete this post?")) return

    try {
      await axios.delete(`${API_URL}/${postId}`)
      alert("post deleted")
      getAllPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const edit_post = async (postId, title, description) => {
    if (!postId) {
      alert("post id is required")
      return
    }

    const updatedTitle = prompt("Enter updated title", title)
    if (updatedTitle === null) return

    const updatedDesc = prompt("Enter updated description", description)
    if (updatedDesc === null) return

    try {
      await axios.put(`${API_URL}/${postId}`, {
        title: updatedTitle,
        description: updatedDesc
      })
      alert("post updated")
      getAllPosts()
    } catch (error) {
      console.error("Error updating post:", error)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 p-4 md:p-8">
      <Form getAllPosts={getAllPosts} />

      <div className="w-full max-w-xl mx-auto space-y-4">
        {posts.length ? (
          posts.map((singlePost) => {
            const postId = singlePost._id || singlePost.id
            const postDate = singlePost.updatedAt || singlePost.createdAt

            return (
              <div
                key={postId}
                className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs flex justify-between items-start gap-4 hover:border-stone-300 transition-all"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-stone-900 text-base leading-tight">
                    {singlePost.title}
                  </h4>
                  <p className="text-stone-600 text-sm whitespace-pre-line">
                    {singlePost.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 text-xs text-stone-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {postDate ? moment(postDate).fromNow() : "Recently"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => edit_post(postId, singlePost.title, singlePost.description)}
                    className="text-stone-400 hover:text-stone-800 p-2 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Edit Post"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => delete_post(postId)}
                    className="text-stone-400 hover:text-red-600 p-2 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center text-stone-400 border border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
            No posts found. Create one above!
          </div>
        )}
      </div>
    </div>
  )
}

export default App