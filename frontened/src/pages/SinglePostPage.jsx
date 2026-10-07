import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import moment from "moment"
import { Clock, ArrowLeft } from 'lucide-react'
import Header from "../component/Header"
import { baseUrl } from "../core"

const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"

const SinglePostPage = () => {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSinglePost = async () => {
      try {
        setLoading(true)
        const resp = await axios.get(`${baseUrl}/api/v1/post/${postId}`)
        setPost(resp.data.data)
      } catch (error) {
        console.error("Error fetching single post:", error)
      } finally {
        setLoading(false)
      }
    }

    if (postId) fetchSinglePost()
  }, [postId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB]">
        <Header />
        <div className="max-w-2xl mx-auto pt-12 px-4">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F4F7FB]">
        <Header />
        <div className="max-w-md mx-auto pt-20 px-4 text-center">
          <h2 className="text-xl font-bold text-gray-800">Post Not Found</h2>
          <Link to="/" className="text-[#851D52] mt-3 inline-block font-medium hover:underline">
            Go back to Feed
          </Link>
        </div>
      </div>
    )
  }

  const author = post?.authorId || {}
  const profilePic = author?.profilePicture || author?.profilepicture || DEFAULT_AVATAR

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header />
      <main className="w-full max-w-2xl mx-auto px-4 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#851D52] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to feed</span>
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={profilePic} 
              alt="User" 
              className="w-12 h-12 rounded-full object-cover border-2 border-[#851D52]"
            />
            <div>
              <h4 className="font-bold text-gray-900 capitalize">
                {author?.firstname || author?.firstName || "User"} {author?.lastname || author?.lastName || ""}
              </h4>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{moment(post.createdAt).fromNow()}</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line break-words">
            {post.description}
          </p>
        </div>
      </main>
    </div>
  )
}

export default SinglePostPage