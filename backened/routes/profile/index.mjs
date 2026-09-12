import express from "express"
import { UserModel } from "../../models/index.mjs"
import bcrypt from "bcryptjs"

const router = express.Router()

// get profile

router.get("/profile", async (req, res, next) => {
    try {
        return res.send({
            message: "profile fetched",
            data: req.currentUser
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

// update profile
router.put("/profile", async (req, res, next) => {
    try {
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

// updated passward
router.put("/passward", async (req, res, next) => {
    try {
        const currentPassward = req.body.currentPassward
        const newPassward = req.body.newPassward

        const isCurrentPasswardTrue = await bcrypt.compare(currentPassward, req.currentUser.password)

        if(!isCurrentPasswardTrue){
            return res.status(400).send({
            message: "current passward is invalid",
        })

        }

        const newPasswordHash = await bcrypt.hash(newPassword, 12)

        await UserModel.findByIdAndUpdate({ _id: req.currentUser._id }, {
            $set: {
                password: newPasswordHash
            }
        })

        return res.send({
            message: "passward updated",
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        })
    }
})

 

 

export default router
