import express from "express"
import { PostModel, NotificationModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"
import { multerMiddleware } from "../../libs/multer.mjs"
import { uploadOnCloudinary } from "../../libs/cloudinary.mjs"

const router = express.Router()


const emitRealtimeNotification = async (req, notification) => {
    try {
        if (!req.io || !global.onlineUsers) return;

        const recipientSocketId = global.onlineUsers.get(notification.recipient.toString());
        if (recipientSocketId) {
            const populatedNotification = await NotificationModel.findById(notification._id)
                .populate("sender", "firstName lastName firstname lastname profilePicture profilepicture profilePic")
                .populate("post", "title imageUrl");

            req.io.to(recipientSocketId).emit("getNotification", populatedNotification);
        }
    } catch (err) {
        console.error("Realtime Emit Error:", err);
    }
};

// CREATE POST
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

        const populatedPost = await PostModel.findById(newPost._id)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture profilePic")

        return res.send({ message: "post created", data: populatedPost })
    } catch (error) {
        console.error("Create Post Error:", error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// GET ALL POSTS (WITH PAGINATION)
router.get("/post", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const skip = (page - 1) * limit

        const totalPosts = await PostModel.countDocuments()

        const posts = await PostModel.find()
            .sort({ _id: -1 }) 
            .skip(skip)
            .limit(limit)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        const hasMore = (skip + posts.length) < totalPosts

        return res.send({
            message: "posts fetched successfully",
            data: posts,
            pagination: {
                totalPosts,
                currentPage: page,
                hasMore,
                limit
            }
        })
    } catch (error) {
        console.error("Fetch Posts Error:", error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// GET SINGLE POST BY ID
router.get("/post/:postId", async (req, res) => {
    try {
        const { postId } = req.params

        if (!isValidObjectId(postId)) {
            return res.status(400).send({ message: "invalid post id" })
        }

        const post = await PostModel.findById(postId)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        if (!post) {
            return res.status(404).send({ message: "post not found" })
        }

        return res.send({
            message: "post fetched successfully",
            data: post
        })
    } catch (error) {
        console.error("Fetch Single Post Error:", error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// EDIT / UPDATE POST
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

        if (post.authorId.toString() !== req.currentUser._id.toString()) {
            return res.status(403).send({ message: "unauthorized: you can only edit your own posts" });
        }

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

// DELETE POST
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

        if (post.authorId.toString() !== req.currentUser._id.toString()) {
            return res.status(403).send({ message: "unauthorized: you can only delete your own posts" });
        }

        await NotificationModel.deleteMany({ post: postId });
        await PostModel.findByIdAndDelete(postId);

        return res.send({ message: "post deleted successfully", postId: postId });
    } catch (error) {
        console.error("Delete Post Error:", error);
        return res.status(500).send({ message: "internal server error" });
    }
});

//LIKE / UNLIKE POST 
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

        if (hasLiked) {
            await NotificationModel.findOneAndDelete({
                recipient: post.authorId,
                sender: userId,
                type: "like",
                post: postId
            });
        } else {
            console.log("POST AUTHOR:", post.authorId.toString());
            console.log("LIKED BY USER:", userId.toString());

            if (post.authorId.toString() !== userId.toString()) {
                const newNotification = await NotificationModel.create({
                    recipient: post.authorId,
                    sender: userId,
                    type: "like",
                    post: postId
                });

                console.log("CREATED NOTIFICATION IN DB:", newNotification);

                // REALTIME SOCKET EMIT
                await emitRealtimeNotification(req, newNotification);
            } else {
                console.log("SKIPPED NOTIFICATION: User liked their own post.");
            }
        }

        return res.send({
            message: hasLiked ? "post unliked" : "post liked",
            liked: !hasLiked,
            likesCount: updatedPost.likes.length
        })
    } catch (error) {
        console.error("LIKE ERROR:", error)
        return res.status(500).send({ message: "internal server error" })
    }
})

//  ADD COMMENT TO POST 
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

        if (post.authorId.toString() !== req.currentUser._id.toString()) {
            const newNotification = await NotificationModel.create({
                recipient: post.authorId,
                sender: req.currentUser._id,
                type: "comment",
                post: postId
            });

            await emitRealtimeNotification(req, newNotification);
        }

        const updatedPost = await PostModel.findById(postId)
            .populate("authorId", "firstName lastName firstname lastname profilePicture profilepicture")
            .populate("comments.authorId", "firstName lastName firstname lastname profilePicture profilepicture")

        return res.send({
            message: "comment added",
            data: updatedPost
        })
    } catch (error) {
        console.error("COMMENT ERROR:", error)
        return res.status(500).send({ message: "internal server error" })
    }
})

// LIKE / UNLIKE COMMENT WITH REALTIME EMIT
router.post("/post/:postId/comment/:commentId/like", async (req, res) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized: please login first" });
        }

        const { postId, commentId } = req.params;
        const userId = req.currentUser._id;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).send({ message: "comment not found" });
        }

        const commentLikes = comment.likes || [];
        const hasLiked = commentLikes.some(id => id.toString() === userId.toString());

        const updateQuery = hasLiked 
            ? { $pull: { "comments.$.likes": userId } } 
            : { $addToSet: { "comments.$.likes": userId } };

        await PostModel.updateOne(
            { _id: postId, "comments._id": commentId },
            updateQuery
        );

        if (hasLiked) {
            await NotificationModel.findOneAndDelete({
                recipient: comment.authorId,
                sender: userId,
                type: "like",
                post: postId
            });
        } else {
            if (comment.authorId.toString() !== userId.toString()) {
                const newNotification = await NotificationModel.create({
                    recipient: comment.authorId,
                    sender: userId,
                    type: "like",
                    post: postId
                });

                await emitRealtimeNotification(req, newNotification);
            }
        }

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