import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, X } from 'lucide-react'

export default function EditPostModal({
  isOpen,
  onClose,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  onSave,
  saving,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => !saving && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-[32px] p-8 shadow-xl border border-gray-100/80 relative"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#f9f0f5] flex items-center justify-center text-[#5E1243] flex-shrink-0">
                  <FileText size={22} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-[#4a0d33] text-xl tracking-tight">
                    Edit Post
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    Update your post title and description
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 ml-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full py-3.5 px-4 bg-[#fdfafb] border border-gray-200/80 rounded-2xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:bg-white focus:border-[#851D52] transition-all"
                  placeholder="Post Title"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 ml-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-[#fdfafb] border border-gray-200/80 rounded-2xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:bg-white focus:border-[#851D52] transition-all resize-none leading-relaxed"
                  placeholder="Write description here..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 py-3.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all cursor-pointer outline-none text-center"
              >
                Cancel
              </button>

              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 py-3.5 rounded-full bg-[#851D52] hover:bg-[#6e1844] text-white text-sm font-semibold shadow-md shadow-[#851D52]/20 transition-all cursor-pointer outline-none text-center"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}