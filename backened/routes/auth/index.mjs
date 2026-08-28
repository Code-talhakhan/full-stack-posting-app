import express from "express"
import { UserModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"
import { emailPattern } from "../../utils/core.mjs"

const router = express.Router()

router.post("/signup", async (req, res, next) => {
    try {
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const email = req.body.email
        const password = req.body.password

        // required validation
        if (!firstname) {
            return res.status(400).send({ message: "firstname is required" })
        }
        if (!lastname) {
            return res.status(400).send({ message: "lastname is required" })
        }
        if (!email) {
            return res.status(400).send({ message: "email is required" })
        }
        if (!password) {
            return res.status(400).send({ message: "password is required" })
        }

        // pattern validation
        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({ message: "email is invalid" })
        }

        
        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (user) {
            return res.status(400).send({ message: "email already taken" })
        } 

        // generate password hash

        // store data in database

        return res.send({ message: "signup done" })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "internal server error" })
    }
})

router.post("/login", async (req, res, next) => {
    try {
        return res.send({ message: "" })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "internal server error" })
    }
})

export default router