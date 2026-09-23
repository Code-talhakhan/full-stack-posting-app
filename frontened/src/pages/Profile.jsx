import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { store } from '../store/states'
import axios from 'axios'
import { baseUrl } from '../core'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, Camera, Pencil, X, Save, ShieldCheck } from 'lucide-react'
import Input from "../component/Input"
import Button from "../component/Button"
import Header from "../component/Header"

const toastStyle = {
  background: 'linear-gradient(to bottom right, #4a0d33, #851D52, #e87163)',
  color: '#ffffff',
  border: 'none',
}

const Profile = () => {
  const navigate = useNavigate()
  const { user, global_login } = store()

  // ---------- Edit name modal ----------
  const [editOpen, set_editOpen] = useState(false)
  const [editFirstname, set_editFirstname] = useState(user.firstname || "")
  const [editLastname, set_editLastname] = useState(user.lastname || "")
  const [savingName, set_savingName] = useState(false)

  const openEditModal = () => {
    set_editFirstname(user.firstname || "")
    set_editLastname(user.lastname || "")
    set_editOpen(true)
  }

  const closeEditModal = () => {
    if (savingName) return
    set_editOpen(false)
  }

  const saveProfile = async () => {
    if (!editFirstname.trim() || !editLastname.trim()) {
      toast.error("First name and last name are required")
      return
    }

    try {
      set_savingName(true)
      await axios.put(`${baseUrl}/api/v1/profile`, {
        firstname: editFirstname,
        lastname: editLastname,
      }, {
        headers: { token: localStorage.getItem("token") }
      })

      global_login({
        ...user,
        firstname: editFirstname,
        lastname: editLastname,
      })

      toast.success("Profile updated", { style: toastStyle })
      set_editOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Failed to update profile")
    } finally {
      set_savingName(false)
    }
  }

  // ---------- Password update ----------
  const [current_password, set_current_password] = useState("")
  const [new_password, set_new_password] = useState("")
  const [rep_password, set_rep_password] = useState("")
  const [savingPassword, set_savingPassword] = useState(false)

  const updatePassword = async () => {
    if (!current_password) {
      toast.error("Current password is required")
      return
    }
    if (!new_password) {
      toast.error("New password is required")
      return
    }
    if (new_password.length < 8) {
      toast.error("New password must be at least 8 characters long")
      return
    }
    if (rep_password !== new_password) {
      toast.error("Passwords do not match")
      return
    }

    try {
      set_savingPassword(true)
      await axios.put(`${baseUrl}/api/v1/password`, {
        currentPassword: current_password,
        newPassword: new_password,
      }, {
        headers: { token: localStorage.getItem("token") }
      })

      toast.success("Password updated", { style: toastStyle })
      set_current_password("")
      set_new_password("")
      set_rep_password("")
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Failed to update password")
    } finally {
      set_savingPassword(false)
    }
  }

  // ---------- Profile picture ----------
  const [uploading, set_uploading] = useState(false)

  const upload_file = async (file) => {
    if (!file) return

    const formData = new FormData()
    formData.append("my-file", file)

    try {
      set_uploading(true)
      const resp = await axios.put(`${baseUrl}/api/v1/profile-picture`, formData, {
        headers: { token: localStorage.getItem("token") }
      })

      global_login({
        ...user,
        profilePicture: resp.data.url
      })

      toast.success("Profile picture updated", { style: toastStyle })
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Failed to upload picture")
    } finally {
      set_uploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-20">
      <Header />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8">

        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-gray-500 hover:text-[#851D52] hover:bg-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div className="h-6 w-1.5 bg-gradient-to-b from-[#4a0d33] to-[#e87163] rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Your Profile</h2>
        </div>

        {/* ---------- Avatar card ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8 flex flex-col items-center text-center mb-6"
        >
          <div className="relative w-32 h-32 mb-5">
            <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-[#4a0d33] via-[#851D52] to-[#e87163]">
              <img
                src={user.profilePicture || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS73K-hNaw6ETaPB2zU7PqIiWDgchEYFoDcaRJLGtHYRg&s=10"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>

            <input
              type="file"
              hidden
              id="profile-selector"
              accept="image/*"
              onChange={(e) => upload_file(e.target.files[0])}
            />

            <label
              htmlFor="profile-selector"
              className="absolute right-0 bottom-0 w-9 h-9 rounded-full bg-gradient-to-r from-[#5E1243] to-[#9c1f52] flex items-center justify-center shadow-lg shadow-[#5E1243]/30 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Camera size={16} className="text-white" strokeWidth={2} />
            </label>
          </div>

          {uploading && (
            <p className="text-xs text-gray-400 mb-2">Uploading photo...</p>
          )}

          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-900">
              {user.firstname} {user.lastname}
            </h3>
            <button
              onClick={openEditModal}
              className="p-1.5 rounded-full text-gray-400 hover:text-[#851D52] hover:bg-[#851D52]/10 transition-colors cursor-pointer"
            >
              <Pencil size={15} strokeWidth={2} />
            </button>
          </div>
        </motion.div>

        {/* ---------- Security card ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <ShieldCheck size={20} className="text-[#851D52]" strokeWidth={2} />
            <h3 className="text-lg font-bold text-gray-800">Security</h3>
          </div>
          <p className="text-sm text-gray-500 mb-5">Update your password</p>

          <div className="space-y-4 max-w-sm">
            <Input
              label="Current Password"
              placeholder="Enter current password"
              isPassword
              value={current_password}
              onChange={(e) => set_current_password(e.target.value)}
            />
            <Input
              label="New Password"
              placeholder="Enter new password"
              isPassword
              value={new_password}
              onChange={(e) => set_new_password(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              placeholder="Confirm new password"
              isPassword
              value={rep_password}
              onChange={(e) => set_rep_password(e.target.value)}
            />

            <Button disabled={savingPassword} onClick={updatePassword}>
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </motion.div>
      </main>

      {/* ---------- Edit Name Modal ---------- */}
      <AnimatePresence>
        {editOpen && (
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
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="p-1 bg-gradient-to-r from-[#4a0d33] via-[#851D52] to-[#e87163]"></div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-[#5E1243]">Edit Profile</h3>
                  <button
                    onClick={closeEditModal}
                    disabled={savingName}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors outline-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="First name"
                    value={editFirstname}
                    onChange={(e) => set_editFirstname(e.target.value)}
                  />
                  <Input
                    label="Last name"
                    value={editLastname}
                    onChange={(e) => set_editLastname(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeEditModal}
                    disabled={savingName}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={savingName}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5E1243] to-[#9c1f52] text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-[#5E1243]/20 disabled:opacity-60 cursor-pointer"
                  >
                    <Save size={16} strokeWidth={2} />
                    {savingName ? "Saving..." : "Save Changes"}
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

export default Profile