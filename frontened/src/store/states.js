import { create } from "zustand"

export const store = create((set) => ({
    user: null,
    isLogin: null,

    // Accept payload as a parameter
    global_login: (userData) => {
        set({
            user: userData,
            isLogin: true,
        })
    },

    global_logout: () => {
        set({
            user: null,
            isLogin: false,
        })
    },
}))