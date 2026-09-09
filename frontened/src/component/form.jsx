import React, { useRef } from 'react'
import axios from 'axios'
import { PlusCircle, Type, FileText } from 'lucide-react'
import { toast } from 'sonner' // Sonner toast import kiya

const API_URL = 'http://localhost:3001/api/v1/post'

export default function Form({ getAllPosts }) {
  const titleRef = useRef(null)
  const descRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation check
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

  return (
    <div className="w-full max-w-xl mx-auto mb-8 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-xl font-sans">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 bg-[#4361EE] text-white rounded-2xl shadow-md shadow-blue-500/20">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800">
            MongoDB-Crud
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            Create and manage posts
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[12px] font-medium text-gray-500 ml-1">
            Title
          </label>
          <div className="relative flex items-center">
            <Type className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Title..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F3F5F9] border-none rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE]/50 transition-all"
              ref={titleRef}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[12px] font-medium text-gray-500 ml-1">
            Description
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
            <textarea
              placeholder="Description..."
              rows={4}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F3F5F9] border-none rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE]/50 transition-all resize-none"
              ref={descRef}
            ></textarea>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 bg-[#4361EE] hover:bg-[#3651D4] text-white font-medium text-sm rounded-xl px-8 py-3 cursor-pointer active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/30"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}