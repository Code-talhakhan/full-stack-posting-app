import "dotenv/config"
import express from "express"
import {postRoutes, authRoutes, profileRoutes} from "./routes/index.mjs"
import cors from "cors"
import morgan from "morgan"
import {connect_database} from "./libs/mongodb.mjs"
import { authGuardJWT } from "./middlewares/jwt/index.mjs"
import { UserModel } from "./models/index.mjs"
import { limiter } from "./middlewares/rate-limit/index.mjs"

const app = express()

// body parser middleware
app.use(express.json())

// cors middleware
app.use(cors({
    origin: "http://localhost:5173",
    methods: "*"
}))

// morgan middleware
app.use(morgan("dev"))

// rate limit
app.use(limiter)

const PORT = process.env.PORT || 3001

app.get("/", (req,res) =>{
     res.send("hello world")
})

app.get("/users", async (req, res, next) => {
    const allUsers = await UserModel.find()
    res.send({
        message : "users fetched",
        data: allUsers
    })
})

app.use("/api/v1",
    authRoutes,
    authGuardJWT,
    postRoutes,
    profileRoutes)


app.listen(PORT, () => {
    console.log("server is running....")
    connect_database()
})