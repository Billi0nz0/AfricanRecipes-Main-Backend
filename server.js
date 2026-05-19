const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
PORT = process.env.PORT || 4000;
require("dotenv").config();
const connectDB = require("./config/db");


const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // or your deployed frontend URL
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
}));


const userRouter = require("./routers/userRouter");
app.use("/auth", userRouter);

const userManagementRouter = require("./routers/userManagementRouter");
app.use("/manage", userManagementRouter);

const categoryRouter = require("./routers/categoryRouter");
app.use("/categories", categoryRouter);

const recipeRouter = require("./routers/recipeRouter");
app.use("/recipes", recipeRouter);

const commentRouter = require("./routers/commentRouter");
app.use("/comments", commentRouter);

const likeRouter = require("./routers/likeRouter");
app.use("/likes", likeRouter);

const analyticsRouter = require("./controllers/analyticsController");
app.use("/analytics", analyticsRouter);






const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, ()=>{
            console.log(`Server is running on http://localhost:${PORT}`)
        });
    } catch (error) {
        console.error("Failed to start server", error.message);
        process.exit(1);
    }
}
startServer();