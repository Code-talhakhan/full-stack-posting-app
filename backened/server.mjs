import "dotenv/config";
import express from "express";
import http from "http"; // 1. Node.js built-in HTTP module
import { Server } from "socket.io"; // 2. Socket.io Server import
import { postRoutes, authRoutes, profileRoutes, notificationRoutes, agentRoutes  } from "./routes/index.mjs";
import cors from "cors";
import morgan from "morgan";
import { connect_database } from "./libs/mongodb.mjs";
import { authGuardJWT } from "./middlewares/jwt/index.mjs";
import { UserModel } from "./models/index.mjs";
import { limiter } from "./middlewares/rate-limit/index.mjs";

const app = express();

// HTTP server instance create karein Express app ke sath
const server = http.createServer(app);

// Socket.io instance initialize karein CORS settings ke sath
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

// Online active users store karne ke liye Map (userId -> socketId)
global.onlineUsers = new Map();

io.on("connection", (socket) => {
    // Frontend se user login hone par user._id register karein
    socket.on("registerUser", (userId) => {
        if (userId) {
            global.onlineUsers.set(userId.toString(), socket.id);
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        }
    });

    // Disconnect event handle karein
    socket.on("disconnect", () => {
        for (let [userId, socketId] of global.onlineUsers.entries()) {
            if (socketId === socket.id) {
                global.onlineUsers.delete(userId);
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    });
});

// Realtime socket instance pass karne ke liye req object mein inject karein
app.use((req, res, next) => {
    req.io = io;
    next();
});

// body parser middleware
app.use(express.json());

// cors middleware
app.use(cors({
    origin: "http://localhost:5173",
    methods: "*"
}));

// morgan middleware
app.use(morgan("dev"));

// rate limit
app.use(limiter);

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
    res.send("hello world");
});

app.get("/users", async (req, res, next) => {
    const allUsers = await UserModel.find();
    res.send({
        message: "users fetched",
        data: allUsers
    });
});

// Public Auth Routes
app.use("/api/v1", authRoutes);

// Protected routes (JWT Auth Required - Har Route Module Separately Mount Hai)
app.use("/api/v1", authGuardJWT, postRoutes);
app.use("/api/v1", authGuardJWT, profileRoutes);
app.use("/api/v1/notifications", authGuardJWT, notificationRoutes);
app.use("/api/v1/agent", authGuardJWT, agentRoutes); // 4. AI Agent Route Mount (`/api/v1/agent/chat`)

// Server Listen
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}....`);
    connect_database();
});