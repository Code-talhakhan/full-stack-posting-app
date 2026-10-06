import express from "express"
import { UserModel, PostModel } from "../../models/index.mjs" 
import bcrypt from "bcryptjs"
import { multerMiddleware } from "../../libs/multer.mjs"
import {uploadOnCloudinary} from "../../libs/cloudinary.mjs"

const router = express.Router()


router.get("/profile", async (req, res, next) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({
                message: "unauthorized: no token provided or invalid token"
            })
        }

        
        const postCount = await PostModel.countDocuments({ authorId: req.currentUser._id });

        const userData = req.currentUser._doc ? req.currentUser._doc : req.currentUser;

        return res.send({
            message: "profile fetched",
            data: {
                ...userData,
                postCount: postCount
            }
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})


router.get("/user/:userId", async (req, res, next) => {
    try {
        const userId = req.params.userId;

      
        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).send({
                message: "user not found"
            });
        }

        // Is specific user ki posts count karein
        const postCount = await PostModel.countDocuments({ authorId: userId });

        const userData = user._doc ? user._doc : user.toObject();

        return res.send({
            message: "user profile fetched",
            data: {
                ...userData,
                postCount: postCount
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        });
    }
})


// update profile
router.put("/profile", async (req, res, next) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized" })
        }

        const firstname = req.body.firstname
        const lastname = req.body.lastname

        const user = await UserModel.findOne({ _id: req.currentUser._id })

        if (!user) {
            return res.status(404).send({
                message: "account not found"
            })
        }

        if (firstname) {
            user.firstname = firstname
        }

        if (lastname) {
            user.lastname = lastname
        }

        await user.save()

        return res.send({
            message: "profile updated",
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        })
    }
})


// update password
router.put("/password", async (req, res, next) => {
    try {
        if (!req.currentUser) {
            return res.status(401).send({ message: "unauthorized" })
        }

        const currentPassword = req.body.currentPassword
        const newPassword = req.body.newPassword

        const isCurrentPasswordTrue = await bcrypt.compare(currentPassword, req.currentUser.password)

        if(!isCurrentPasswordTrue){
            return res.status(400).send({
            message: "current password is invalid",
        })

        }

        const newPasswordHash = await bcrypt.hash(newPassword, 12)

        await UserModel.findByIdAndUpdate({ _id: req.currentUser._id }, {
            $set: {
                password: newPasswordHash
            }
        })

        return res.send({
            message: "password updated",
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// update profile-pic

router.put("/profile-picture", multerMiddleware.any(), async (req, res, next) =>{
    try {
        const file = req.files[0]

        if(!file){
           return res.status(400).send({
            message: "file is required"
            })
        }

        if(!file.mimetype.startsWith("image")){
            return res.status(400).send({
                message: "only images are allowed"
            })
        }

        if(file.size > 1000000){
            return res.status(400).send({
                message: "file upload limit is 1mb"
            })
        }

        // upload file on cloudinary
        // save cloudinary url to database
        const fileResp = await uploadOnCloudinary(file)

        await UserModel.findByIdAndUpdate({ _id: req.currentUser._id }, {
            $set: {

                profilepicture: fileResp.secure_url
                
            }
        })

        return res.send({
            message: "profile picture updated",
            url: fileResp.secure_url
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

router.get("/profile/posts/:userId", async (req, res, next) => {
    try {
        const skip = req.query.skip || 0

        const allPosts = await PostModel.find({ userId: req.params.userId })
            .populate("userId")
            .populate({
                path: "likes",
                select: "firstname lastname profilePicture"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(5)

        const totalPosts = await PostModel.countDocuments({ userId: req.params.userId })

        return res.send({
            message: "profile posts fetched",
            data: allPosts,
            totalPosts: totalPosts,
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        })
    }
})


export default router