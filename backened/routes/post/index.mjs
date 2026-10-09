import express from "express"
import { PostModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"
import {multerMiddleware} from "../../libs/multer.mjs"
import {uploadOnCloudinary} from "../../libs/cloudinary.mjs"

const router = express.Router()

// 1. CREATE POST
// CREATE POST ROUTE
router.post("/post", multerMiddleware.any(), async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized: please login first" })
        }
        if (!req.body.title || !req.body.description) {
            return res.status(400).send({ message: "Title and Description are required" })
        }

        const file = req?.files?.[0]
        let imageUrl = null

        if (file) {
            const fileResp = await uploadOnCloudinary(file)
            imageUrl = fileResp?.secure_url || fileResp?.url || null
        }

        const newPost = await PostModel.create({
            title: req.body.title,
            description: req.body.description,
            authorId: req.currentUser._id,
            imageUrl: imageUrl
        })

        // User profile picture aur names populate karein
        const populatedPost = await PostModel.findById(newPost._id)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture profilePic")

        return res.send({ message: "post created", data: populatedPost })
    } catch (error) {
        console.error("Create Post Error:", error)
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

// 6. EDIT / UPDATE POST
router.put("/post/:postId", multerMiddleware.any(), async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized: please login first" });
        }

        const { postId } = req.params;
        if (!isValidObjectId(postId)) {
            return res.status(400).send({ message: "invalid post id" });
        }

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "post not found" });
        }

        // Ownership Check: Sirf wahi user update kar sakta hai jisne post banayi ho
        if (post.authorId.toString() !== req.currentUser._id.toString()) {
            return res.status(403).send({ message: "unauthorized: you can only edit your own posts" });
        }

        // Check if new image uploaded
        const file = req?.files?.[0];
        let imageUrl = post.imageUrl;

        if (file) {
            const fileResp = await uploadOnCloudinary(file);
            imageUrl = fileResp?.secure_url || fileResp?.url || imageUrl;
        }

        const updatedData = {
            title: req.body.title || post.title,
            description: req.body.description || post.description,
            imageUrl: imageUrl
        };

        const updatedPost = await PostModel.findByIdAndUpdate(postId, updatedData, { new: true })
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture");

        return res.send({ message: "post updated successfully", data: updatedPost });
    } catch (error) {
        console.error("Update Post Error:", error);
        return res.status(500).send({ message: "internal server error" });
    }
});

// 7. DELETE POST
router.delete("/post/:postId", async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized: please login first" });
        }

        const { postId } = req.params;
        if (!isValidObjectId(postId)) {
            return res.status(400).send({ message: "invalid post id" });
        }

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "post not found" });
        }

        // Ownership Check: Sirf owner hi delete kar sake
        if (post.authorId.toString() !== req.currentUser._id.toString()) {
            return res.status(403).send({ message: "unauthorized: you can only delete your own posts" });
        }

        await PostModel.findByIdAndDelete(postId);

        return res.send({ message: "post deleted successfully", postId: postId });
    } catch (error) {
        console.error("Delete Post Error:", error);
        return res.status(500).send({ message: "internal server error" });
    }
});

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
// 5. LIKE / UNLIKE A SPECIFIC COMMENT
// 5. LIKE / UNLIKE A SPECIFIC COMMENT
router.post("/post/:postId/comment/:commentId/like", async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized: please login first" });
        }

        const { postId, commentId } = req.params;
        const userId = req.currentUser._id;

        // 1. Check if Post & Comment exist
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).send({ message: "comment not found" });
        }

        // 2. Safely check if user already liked
        const commentLikes = comment.likes || [];
        const hasLiked = commentLikes.some(id => id.toString() === userId.toString());

        // 3. Positional Operator Query for Embedded Subdocument Array
        const updateQuery = hasLiked 
            ? { $pull: { "comments.$.likes": userId } } 
            : { $addToSet: { "comments.$.likes": userId } };

        // Database me direct atomic write
        await PostModel.updateOne(
            { _id: postId, "comments._id": commentId },
            updateQuery
        );

        // 4. Fetch Populated Updated Post
        const updatedPost = await PostModel.findById(postId)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture");

        return res.send({
            message: hasLiked ? "comment unliked" : "comment liked",
            data: updatedPost
        });

    } catch (error) {
        console.error("Comment Like Error:", error);
        return res.status(500).send({ message: "internal server error" });
    }
});
export default router