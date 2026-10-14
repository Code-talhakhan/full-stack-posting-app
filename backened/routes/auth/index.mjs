import express from "express"
import { UserModel, EmailOtpModel } from "../../models/index.mjs"
import { isValidObjectId } from "mongoose"
import { emailPattern } from "../../utils/core.mjs"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import otpGenerator from "otp-generator"
import { sendEmail } from "../../utils/funcation.mjs"

const router = express.Router()

// AUTH API
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

        const userAccount = await UserModel.findOne({ email: email.toLowerCase() })

        if (!userAccount) {
            return res.status(400).send({ message: "invalid credentials" })
        }

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

// VERIFICATIONS APIS

router.post("/send-otp", async (req, res, next) => {
    try {
        const email = req.body.email

        // email validation
        if (!email) {
            return res.status(400).send({
                message: "email is required"
            })
        }

        // pattern validation
        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({
                message: "email is invalid"
            })
        }

        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(404).send({
                message: "account not found"
            })
        }

        // generate otp
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        // generate otpHash
        const otpCodeHash = await bcrypt.hash(otp, 12)

        // purane OTP delete kar rahe hain taakay duplicate na banein
        await EmailOtpModel.deleteMany({ email: email.toLowerCase() })

        // save otp hash it to database with user email
        await EmailOtpModel.create({
            email: email.toLowerCase(),
            otpCodeHash: otpCodeHash
        })

        // send otp to email
        await sendEmail(
            email.toLowerCase(),
            "Verify Your Email",
            `Hello user here is your email verification OTP ${otp} please don't share with anyone`
        )

        return res.send({
            message: "otp sent successfully",
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        })
    }
})  

// verify otp

router.post("/verify-otp", async (req, res, next) => {
    try {
        const email = req.body.email
        const otp = req.body.otp

        // email validation
        if (!email) {
            return res.status(400).send({
                message: "email is required"
            })
        }
        
        // pattern validation
        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({
                message: "email is invalid"
            })
        }
        // otp validation
        if(!otp) {
            return res.status(400).send({
                message: "otp is required"
            })
        }

        // does otp exist for email
        const existingOtp = await EmailOtpModel.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 })

        if (!existingOtp) {
            return res.status(400).send({
                message: "otp is invalid"
            })
        }

        // is otp correct
        const isOtpValid = await bcrypt.compare(String(otp), existingOtp.otpCodeHash)
        if (!isOtpValid) {
            return res.status(400).send({
                message: "otp is invalid"
            })
        }

        // mark email verified
        await UserModel.updateOne({ email: email.toLowerCase() }, {
            $set: {
                isEmailVerified: true
            }
        })

        // OTP verified ho gaya tou DB se clear kar do
        await EmailOtpModel.deleteMany({ email: email.toLowerCase() })

        return res.send({
            message: "email verified"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "internal server error"
        })
    }
})  

export default router