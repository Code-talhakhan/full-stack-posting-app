import "dotenv/config"
import express from "express"
import {postRoutes, authRoutes} from "./routes/index.mjs"
import cors from "cors"
import {connect_database} from "./libs/mongodb.mjs"
import { authGuardJWT } from "./middlewares/jwt/index.mjs"

const app = express()

app.use(express.json())

app.use(cors({
    origin: "http://localhost:5173",
    methods: "*"
}))

const PORT = process.env.PORT || 3001

app.get("/", (req,res) =>{
     res.send("hello world")
})

app.use("/api/v1", authRoutes)
app.use("/api/v1", authGuardJWT)
app.use("/api/v1", postRoutes)
app.use("/api/v1", profileRoutes)





app.listen(PORT, () => {
    console.log("server is running....")
    connect_database()
})