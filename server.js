const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4000;
require("dotenv").config();
const connectDB = require("./config/db");


const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: [
        "https://afrirecipes.com",
        "https://www.afrirecipes.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.get("/health", (req, res) => { 
  res.status(200).json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() 
  });
});

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

const contactRouter = require("./routers/contactRouter");
app.use("/contact", contactRouter);

const likeRouter = require("./routers/likeRouter");
app.use("/likes", likeRouter);

const analyticsRouter = require("./controllers/analyticsController");
app.use("/analytics", analyticsRouter);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error.",
    });
});


const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error.message);
        process.exit(1);
    }
}
startServer();
