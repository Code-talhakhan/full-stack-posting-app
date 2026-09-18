
export const store = create((update) => {
    return {
       
        user: null,
        isLogin: null,

        

        global_login: () => {
            update((state) => ({
                user: "some user detailes",
                isLogin: true
            }))
        },

        global_logout: () => {
            update((state) => ({
                user: null,
                isLogin: false,
            }))
        },

    }
})