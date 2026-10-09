import React, { useRef, useState } from 'react'
import axios from 'axios'
import { PlusCircle, Type, FileText, Image, X } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = 'http://localhost:3001/api/v1/post'

export default function Form({ getAllPosts }) {
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("Submit clicked. Title:", title, "Desc:", description, "File:", imageFile)

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in Title and Description!')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      
      if (imageFile) {
        formData.append("files", imageFile)
      }

      const response = await axios.post(API_URL, formData, {
        headers: {
          token: token,
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Post Response:", response.data)

      // Clear Form Fields After Success
      setTitle('')
      setDescription('')
      removeImage()

      // Refresh Feed Posts
      if (getAllPosts) getAllPosts()

      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error adding post:', error)
      toast.error(error?.response?.data?.message || 'Failed to create post!')
    } finally {
      setSubmitting(false)
    }
  }

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
          {/* Title */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[12px] font-medium text-gray-500 ml-1">
              Title
            </label>
            <div className="relative flex items-center">
              <Type className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border-none rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/50 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[12px] font-medium text-gray-500 ml-1">
              Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
              <textarea
                placeholder="Description..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F3F5F9] border-none rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#851D52]/50 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* Upload Photo & Preview */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[12px] font-medium text-gray-500 ml-1">
              Attachment
            </label>
            {previewUrl ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                <img src={previewUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#F3F5F9] border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#851D52] hover:bg-gray-100 transition-all text-gray-500 hover:text-[#851D52]">
                <Image className="w-4 h-4 text-[#851D52]" />
                <span className="text-xs font-semibold">Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#5E1243] to-[#9c1f52] hover:opacity-90 text-white font-medium text-sm rounded-xl px-8 py-3 cursor-pointer active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#5E1243]/20 disabled:opacity-50"
              type="submit"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}