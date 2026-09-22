import React, { useRef } from 'react'
import axios from 'axios'
import { PlusCircle, Type, FileText } from 'lucide-react'
import { toast } from 'sonner' 

const API_URL = 'http://localhost:3001/api/v1/post'

export default function Form({ getAllPosts }) {
  const titleRef = useRef(null)
  const descRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!titleRef.current.value.trim() || !descRef.current.value.trim()) {
      toast.error('Please fill in all fields!')
      return
    }

    const newPost = {
      title: titleRef.current.value,
      description: descRef.current.value,
      createdAt: new Date().toISOString()
    }

    try {
      await axios.post(API_URL, newPost)
      titleRef.current.value = ''
      descRef.current.value = ''

      if (getAllPosts) getAllPosts()

      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error adding post:', error)
      toast.error(error?.response?.data?.message || 'Failed to create post!')
    }
  }

  // Wrapper element with pl-[6px] for the gradient border effect
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 rounded-[2rem] bg-gradient-to-b from-[#5E1243] to-[#9c1f52] pl-[6px] shadow-xl font-sans transition-all duration-300">
      
      <div className="bg-white rounded-l-[26px] rounded-r-[2rem] p-6 h-full w-full">
        
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163] text-white rounded-2xl shadow-md shadow-[#851D52]/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#5E1243]">
              Create Post
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Create and manage posts
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[12px] font-medium text-gray-500 ml-1">
              Title
            </label>
            <div className="relative flex items-center">
              <Type className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Title..."
                className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border-none rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/50 transition-all"
                ref={titleRef}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-[12px] font-medium text-gray-500 ml-1">
              Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
              <textarea
                placeholder="Description..."
                rows={3}
                className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border-none rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/50 transition-all resize-none"
                ref={descRef}
              ></textarea>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#5E1243] to-[#9c1f52] hover:opacity-90 text-white font-medium text-sm rounded-xl px-8 py-3 cursor-pointer active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#5E1243]/20"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}