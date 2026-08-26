import React, { useRef } from 'react'
import axios from 'axios'
import { PlusCircle, Type, FileText } from 'lucide-react'

const API_URL = 'http://localhost:3001/api/v1/post'

export default function Form({ getAllPosts }) {
  const titleRef = useRef(null)
  const descRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      
      alert('Post created successfully!')
    } catch (error) {
      console.error('Error adding post:', error)
      alert('Failed to create post!')
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto mb-8 p-6 bg-stone-50/80 border border-stone-200 rounded-2xl shadow-xs backdrop-blur-xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200">
        <div className="p-2.5 bg-stone-900 text-stone-50 rounded-xl shadow-xs">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">
            MongoDB-Crud
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Create and manage posts
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
            Title
          </label>
          <div className="relative flex items-center">
            <Type className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Title..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-xl shadow-xs focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all duration-200"
              ref={titleRef}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-700 tracking-wide uppercase">
            Description
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 absolute left-3.5 top-3 text-stone-400 pointer-events-none" />
            <textarea
              placeholder="Description..."
              rows={4}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white text-stone-900 placeholder:text-stone-400 border border-stone-300 rounded-xl shadow-xs focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all duration-200 resize-none"
              ref={descRef}
              required
            ></textarea>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 bg-stone-900 text-stone-50 font-medium text-sm rounded-xl px-8 py-2.5 cursor-pointer hover:bg-stone-800 active:scale-[0.99] transition-all duration-200 shadow-xs"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}