const express = require("express");
const cors = require("cors")
const cookieParser = require("cookie-parser");


const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const authMiddleware = require("./middlewares/auth.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
require("./services/taskReminder");

const app = express();

app.use(
  cors({
    origin: "http://172.20.10.10:3000", // ضع هنا عنوان الـ Frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // لتمكين إرسال الكوكيز مع الطلبات
  })
);  

// Connect to MongoDB
connectDB();


// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes); 


// Middleware to parse JSON request bodies
app.use(express.json());

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
