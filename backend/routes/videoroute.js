const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Video = require("../models/video");
const JourneyTrackingService = require('../services/JourneyTracking');
const router = express.Router();

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "videos",
      resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    };
  },
});

const upload = multer({ storage });

// ============================
// 1️⃣ Upload Video
// ============================
router.post(
  "/upload",
  upload.fields([{ name: "thumbnail" }, { name: "video" }]),
  async (req, res) => {
    try {
      const { title, description, type, category } = req.body;

      // Validate required fields
      if (!title || !description || !type || !category) {
        return res.status(400).json({ message: "Title, description, type, and category are required" });
      }

      // Validate type ENUM
      const allowedTypes = ["Course", "Tutorial", "Lecture"];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type. Allowed values: Course, Tutorial, Lecture" });
      }

      if (!req.files || !req.files["thumbnail"] || !req.files["video"]) {
        return res.status(400).json({ message: "Thumbnail and video are required" });
      }

      // Cloudinary URLs
      const thumbnailUrl = req.files["thumbnail"][0].path;
      const videoUrl = req.files["video"][0].path;

      // Save to database
      const newVideo = new Video({
        title,
        description,
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        type,
        category, // Added category
        views: 0,
        approved: false, // Default false
      });

      await newVideo.save();

      res.status(201).json({ message: "Video uploaded successfully, pending approval", video: newVideo });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// ============================
// 2️⃣ Get Only Approved Videos
// ============================
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find({ approved: true }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Fetch Videos Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/not", async (req, res) => {
  try {
    const videos = await Video.find({ approved: false }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Fetch Videos Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ============================
// 3️⃣ Approve a Video (Admin)
// ============================
router.put("/:id/approve", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json({ message: "Video approved successfully", video });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ============================
// 4️⃣ Update Video Views Count
// ============================
router.put("/:id/views", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Update Views Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ============================
// 5️⃣ Delete a Video
// ============================
router.delete("/:id", async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete Video Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/:id", async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Fetch Video by ID Error:", error);
      
      // Handle invalid ID format error
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid video ID format" });
      }
      
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
// ============================
// 4️⃣ Update Video Views Count
// ============================
router.put("/:id/views", async (req, res) => {
    try {
      const videoId = req.params.id;
      
      // Find the video and increment its views count
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId, 
        { $inc: { views: 1 } }, 
        { new: true } // This ensures we get the updated document back
      );
      
      // If no video found with that ID
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Return the updated video
      res.json(updatedVideo);
    } catch (error) {
      console.error("Update Views Error:", error);
      
      // Handle invalid ID format
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid video ID format" });
      }
      
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
module.exports = router;
