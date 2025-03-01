const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoute")
const videoRoutes = require("./routes/videoroute.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON parsing
require('dotenv').config();
// Database Connection
const url=process.env.mongo_url;
console.log(url);
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("DB Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
