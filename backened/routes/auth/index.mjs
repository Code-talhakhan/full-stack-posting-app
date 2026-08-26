import express from "express"
import { } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"

const router = express.Router()

router.post("/", async (req, res, next) => {
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


export default router