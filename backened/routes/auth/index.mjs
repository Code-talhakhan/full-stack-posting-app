import express from "express"
import { UserModel, EmailOtpModel, PasswordOtpModel } from "../../models/index.mjs"
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

        if (!userAccount.isEmailVerified) { 
            return res.status(400).send({ message: "email is not verified" })
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
                    email: userAccount.email,
                    isEmailVerified: userAccount.isEmailVerified
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

        if (!email) {
            return res.status(400).send({ message: "email is required" })
        }

        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({ message: "email is invalid" })
        }

        const user = await UserModel.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(404).send({ message: "account not found" })
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        const otpCodeHash = await bcrypt.hash(otp, 12)

        await EmailOtpModel.deleteMany({ email: email.toLowerCase() })

        await EmailOtpModel.create({
            email: email.toLowerCase(),
            otpCodeHash: otpCodeHash
        })

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
        return res.status(500).send({ message: "internal server error" })
    }
})  

router.post("/verify-otp", async (req, res, next) => {
    try {
        const email = req.body.email
        const otp = req.body.otp

        if (!email) {
            return res.status(400).send({ message: "email is required" })
        }
        
        if (!emailPattern.test(email.toLowerCase())) {
            return res.status(400).send({ message: "email is invalid" })
        }

        if(!otp) {
            return res.status(400).send({ message: "otp is required" })
        }

        const existingOtp = await EmailOtpModel.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 })

        if (!existingOtp) {
            return res.status(400).send({ message: "otp is invalid" })
        }

        const isOtpValid = await bcrypt.compare(String(otp), existingOtp.otpCodeHash)
        if (!isOtpValid) {
            return res.status(400).send({ message: "otp is invalid" })
        }

        await UserModel.updateOne({ email: email.toLowerCase() }, {
            $set: { isEmailVerified: true }
        })

        await EmailOtpModel.deleteMany({ email: email.toLowerCase() })

        return res.send({ message: "email verified" })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "internal server error" })
    }
})  

// FORGOT PASSWORD - SEND OTP (ADDED MISSING ROUTE)
router.post("/send-password-otp", async (req, res) => {
    try {
        const cleanEmail = req.body.email ? req.body.email.trim().toLowerCase() : ""

        if (!cleanEmail) {
            return res.status(400).send({ message: "email is required" })
        }

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).send({ message: "email is invalid" })
        }

        const user = await UserModel.findOne({ email: cleanEmail })
        if (!user) {
            return res.status(404).send({ message: "account with this email does not exist" })
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        const otpCodeHash = await bcrypt.hash(otp, 12)

        await PasswordOtpModel.deleteMany({ email: cleanEmail })

        await PasswordOtpModel.create({
            email: cleanEmail,
            otpCodeHash: otpCodeHash
        })

        await sendEmail(
            cleanEmail,
            "Reset Your Password OTP",
            `Your password reset verification code is: ${otp}. Do not share it with anyone.`
        )

        return res.send({ message: "OTP sent to your email successfully" })

    } catch (error) {
        console.error("SEND_PASSWORD_OTP_ERROR:", error);
        return res.status(500).send({ message: "internal server error" })
    }
})

// FORGOT PASSWORD - COMPLETE RESET
router.post("/forgot-password-complete", async (req, res, next) => {
    try {
        const cleanEmail = req.body.email ? req.body.email.trim().toLowerCase() : ""
        const cleanOtp = req.body.otp ? String(req.body.otp).trim() : ""
        const newPassword = req.body.newPassword

        if (!cleanEmail) {
            return res.status(400).send({ message: "email is required" })
        }

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).send({ message: "email is invalid" })
        }

        if (!cleanOtp) {
            return res.status(400).send({ message: "otp is required" })
        }

        if (!newPassword) {
            return res.status(400).send({ message: "password is required" })
        }

        const existingOtp = await PasswordOtpModel.findOne({ email: cleanEmail }).sort({ createdAt: -1 })

        if (!existingOtp) {
            return res.status(400).send({ message: "otp is invalid or expired" })
        }

        const otpAgeMinutes = (Date.now() - new Date(existingOtp.createdAt).getTime()) / (1000 * 60)
        if (otpAgeMinutes > 10) {
            await PasswordOtpModel.deleteOne({ _id: existingOtp._id })
            return res.status(400).send({ message: "otp is expired. Please request a new one." })
        }

        const isOtpValid = await bcrypt.compare(cleanOtp, existingOtp.otpCodeHash)
        if (!isOtpValid) {
            return res.status(400).send({ message: "otp is invalid" })
        }

        const passwordHash = await bcrypt.hash(newPassword, 12)

        const updateResult = await UserModel.updateOne(
            { email: cleanEmail },
            { $set: { password: passwordHash } }
        )

        if (updateResult.matchedCount === 0) {
            return res.status(404).send({ message: "user with this email does not exist" })
        }

        await PasswordOtpModel.deleteMany({ email: cleanEmail })

        return res.send({ message: "password updated successfully" })

    } catch (error) {
        console.error("FORGOT_PASSWORD_COMPLETE_ERROR:", error);
        return res.status(500).send({ message: "internal server error" })
    }
})

export default router