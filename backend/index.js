import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import {app,server,io} from "./lib/socket.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URL', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}));
app.use(express.json())
app.use(cookieParser());

const PORT= process.env.PORT || 8080;
server.listen(PORT, ()=>{
    console.log(`Server is Running on ${PORT}`)
    connectDB()
})
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

 