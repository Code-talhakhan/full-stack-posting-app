import express from "express"
import { PostModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"

const router = express.Router()

// 1. CREATE POST
router.post("/post", async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({
                message: "unauthorized: please login first"
            })
        }

        if (!req.body.title) {
            return res.status(400).send({
                message: "Title field cannot be empty"
            })
        }

        if (!req.body.description) {
            return res.status(400).send({
                message: "Description field cannot be empty"
            })
        }

        await PostModel.create({
            title: req.body.title,
            description: req.body.description,
            authorId: req.currentUser._id 
        })

        return res.send({
            message: "post created"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// 2. GET ALL POSTS
router.get("/post", async (req, res) => {
    try {
        const allPost = await PostModel.find()
            .sort({ _id: -1 }) 
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        return res.send({
            message: "all posts fetched",
            data: allPost
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// 3. LIKE / UNLIKE POST TOGGLE
router.post("/post/:postId/like", async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({
                message: "unauthorized: please login first"
            })
        }

        const { postId } = req.params
        const userId = req.currentUser._id

        if (!isValidObjectId(postId)) {
            return res.status(400).send({
                message: "invalid post id"
            })
        }

        const post = await PostModel.findById(postId)
        if (!post) {
            return res.status(404).send({
                message: "post not found"
            })
        }

        const hasLiked = post.likes.some(id => id.toString() === userId.toString())

        let updateQuery = {}
        if (hasLiked) {
            // Un-like
            updateQuery = { $pull: { likes: userId } }
        } else {
            // Like
            updateQuery = { $addToSet: { likes: userId } }
        }

        const updatedPost = await PostModel.findByIdAndUpdate(postId, updateQuery, { new: true })

        return res.send({
            message: hasLiked ? "post unliked" : "post liked",
            liked: !hasLiked,
            likesCount: updatedPost.likes.length
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// 4. GET SINGLE POST BY ID
router.get("/post/:postId", async (req, res) => {
    try {
        const { postId } = req.params

        if (!postId || !isValidObjectId(postId)) {
            return res.status(400).send({
                message: "valid id is required"
            })
        }

        const singlePost = await PostModel.findOne({ _id: postId })
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        if (!singlePost) {
            return res.status(404).send({
                message: "post not found"
            })
        }

        return res.send({
            message: "single post fetched",
            data: singlePost
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// 5. DELETE POST BY ID
router.delete("/post/:postId", async (req, res) => {
    try {
        const { postId } = req.params

        if (!postId || !isValidObjectId(postId)) {
            return res.status(400).send({
                message: "valid id is required"
            })
        }

        const deletedPost = await PostModel.findByIdAndDelete(postId)

        if (!deletedPost) {
            return res.status(404).send({
                message: "post not found"
            })
        }

        return res.send({
            message: "single post deleted"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// 6. UPDATE POST BY ID
router.put("/post/:postId", async (req, res) => {
    try {
        const { postId } = req.params

        if (!postId || !isValidObjectId(postId)) {
            return res.status(400).send({
                message: "valid id is required"
            })
        }

        if (!req.body.title || !req.body.description) {
            return res.status(400).send({
                message: "title and description are required"
            })
        }

        const updatedPost = await PostModel.findByIdAndUpdate(
            postId,
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                }
            },
            { new: true }
        )

        if (!updatedPost) {
            return res.status(404).send({
                message: "post not found"
            })
        }

        return res.send({
            message: "single post updated",
            data: updatedPost
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

export default router