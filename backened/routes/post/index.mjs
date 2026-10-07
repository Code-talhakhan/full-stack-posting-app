import express from "express"
import { PostModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"

const router = express.Router()

// 1. CREATE POST
router.post("/post", async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized: please login first" })
        }
        if (!req.body.title || !req.body.description) {
            return res.status(400).send({ message: "Title and Description are required" })
        }

        await PostModel.create({
            title: req.body.title,
            description: req.body.description,
            authorId: req.currentUser._id 
        })

        return res.send({ message: "post created" })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// 2. GET ALL POSTS
router.get("/post", async (req, res) => {
    try {
        const allPost = await PostModel.find()
            .sort({ _id: -1 }) 
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        return res.send({
            message: "all posts fetched",
            data: allPost
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// 3. LIKE / UNLIKE POST
router.post("/post/:postId/like", async (req, res) => {
    try {
        if (!req.currentUser) return res.status(401).send({ message: "unauthorized" })

        const { postId } = req.params
        const userId = req.currentUser._id

        const post = await PostModel.findById(postId)
        if (!post) return res.status(404).send({ message: "post not found" })

        const hasLiked = post.likes.some(id => id.toString() === userId.toString())
        const updateQuery = hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } }

        const updatedPost = await PostModel.findByIdAndUpdate(postId, updateQuery, { new: true })

        return res.send({
            message: hasLiked ? "post unliked" : "post liked",
            liked: !hasLiked,
            likesCount: updatedPost.likes.length
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// 4. ADD COMMENT TO POST
router.post("/post/:postId/comment", async (req, res) => {
    try {
        if (!req.currentUser) return res.status(401).send({ message: "unauthorized" })

        const { postId } = req.params
        const { text } = req.body

        if (!text || !text.trim()) {
            return res.status(400).send({ message: "Comment content cannot be empty" })
        }

        const post = await PostModel.findById(postId)
        if (!post) return res.status(404).send({ message: "post not found" })

        post.comments.push({
            content: text.trim(),
            authorId: req.currentUser._id,
            likes: []
        })

        await post.save()

        const updatedPost = await PostModel.findById(postId)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        return res.send({
            message: "comment added",
            data: updatedPost
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// 5. LIKE / UNLIKE A SPECIFIC COMMENT
router.post("/post/:postId/comment/:commentId/like", async (req, res) => {
    try {
        if (!req.currentUser) return res.status(401).send({ message: "unauthorized" })

        const { postId, commentId } = req.params
        const userId = req.currentUser._id

        const post = await PostModel.findById(postId)
        if (!post) return res.status(404).send({ message: "post not found" })

        const comment = post.comments.id(commentId)
        if (!comment) return res.status(404).send({ message: "comment not found" })

        const hasLiked = comment.likes.some(id => id.toString() === userId.toString())

        if (hasLiked) {
            comment.likes.pull(userId)
        } else {
            comment.likes.addToSet(userId)
        }

        await post.save()

        const updatedPost = await PostModel.findById(postId)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        return res.send({
            message: hasLiked ? "comment unliked" : "comment liked",
            data: updatedPost
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "internal server error" })
    }
})

export default router