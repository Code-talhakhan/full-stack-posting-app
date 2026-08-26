import express from "express"
import { PostModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"

const router = express.Router()

// 1. CREATE POST
router.post("/post", async (req, res, next) => {
    try {
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
router.get("/post", async (req, res, next) => {
    try {
        const allPost = await PostModel.find()

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

// 3. GET SINGLE POST BY ID
router.get("/post/:postId", async (req, res, next) => {
    try {
        const postId = req.params.postId

        if (!postId) {
            return res.status(400).send({
                message: "id is required"
            })
        }

        if (!isValidObjectId(postId)) {
            return res.status(400).send({
                message: "id is invalid"
            })
        }

        const singlePost = await PostModel.findOne({ _id: postId })

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

// 4. DELETE POST BY ID
router.delete("/post/:postId", async (req, res, next) => {
    try {
        const postId = req.params.postId

        if (!postId) {
            return res.status(400).send({
                message: "id is required"
            })
        }

        if (!isValidObjectId(postId)) {
            return res.status(400).send({
                message: "id is invalid"
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

// 5. UPDATE POST BY ID
router.put("/post/:postId", async (req, res, next) => {
    try {
        const postId = req.params.postId

        if (!postId) {
            return res.status(400).send({
                message: "id is required"
            })
        }

        if (!isValidObjectId(postId)) {
            return res.status(400).send({
                message: "id is invalid"
            })
        }

        if (!req.body.title) {
            return res.status(400).send({
                message: "title is required"
            })
        }

        if (!req.body.description) {
            return res.status(400).send({
                message: "description is required"
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