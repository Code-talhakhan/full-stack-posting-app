import express from "express"
import { UserModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"
import { emailPattern } from "../../utils/core.mjs"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = express.Router()

// 1. SIGNUP ROUTE
router.post("/signup", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).send({ message: "all fields are required" })
        }

        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({ message: "invalid email format" })
        }

        const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return res.status(400).send({ message: "email already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await UserModel.create({
            firstname,
            lastname,
            email: email.toLowerCase(),
            password: hashedPassword
        })

        return res.status(201).send({
            message: "Signup Successful",
            data: {
                _id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email
            }
        })

    } catch (error) {
        console.error("SIGNUP_ERROR:", error)
        return res.status(500).send({ message: error.message || "internal server error" })
    }
})

// 2. LOGIN ROUTE
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).send({ message: "email is required" })
        }
        if (!password) {
            return res.status(400).send({ message: "password is required" })
        }

        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({ message: "invalid credentials" })
        }

        // FIX 1: Use findOne instead of find
        const userAccount = await UserModel.findOne({ email: email.toLowerCase() })

        if (!userAccount) {
            return res.status(400).send({ message: "invalid credentials" })
        }

        // FIX 2: Compare with single object password
        const isPasswordTrue = await bcrypt.compare(password, userAccount.password)
        if (!isPasswordTrue) {
            return res.status(400).send({ message: "invalid credentials" })
        }

        // Generate Token
        const token = jwt.sign(
            {
                email: userAccount.email,
                _id: userAccount._id
            },
            process.env.JWT_KEY || "secret_key_fallback",
            { expiresIn: '20d' }
        )

        // FIX 3: Return token AND user object matching frontend expectation
        return res.send({
            message: "Login Done",
            data: {
                token: token,
                user: {
                    _id: userAccount._id,
                    firstname: userAccount.firstname,
                    lastname: userAccount.lastname,
                    email: userAccount.email
                }
            }
        })

    } catch (error) {
        console.error("LOGIN_ERROR:", error)
        return res.status(500).send({ message: error.message || "internal server error" })
    }
})

export default router