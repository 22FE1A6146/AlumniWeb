import express from "express";
import { verifyToken } from "../middleware/auth.js";
import Alumni from "../models/Alumni.js";

const router = express.Router();

// @route   GET /api/alumni
// @desc    Get all alumni (with optional batch query, grouped by batch, or grouped by batch and major)
// @access  Public
router.get("/", async (req, res) => {
  try {
    console.log('Query params:', req.query); // Debug log
    const { batch, groupByBatch, groupByBatchAndMajor } = req.query;

    if (batch) {
      // Filter by specific batch
      const alumni = await Alumni.find({ batch }).select("-__v");
      return res.status(200).json(alumni);
    }

    if (groupByBatchAndMajor === "true") {
      // Group by batch and major
      const alumni = await Alumni.find().select("-__v");
      if (alumni.length === 0) {
        return res.status(200).json({});
      }
      const groupedAlumni = alumni.reduce((acc, alum) => {
        const batchYear = alum.batch || "Unknown";
        const major = alum.major || "Unknown";
        if (!acc[batchYear]) {
          acc[batchYear] = {};
        }
        if (!acc[batchYear][major]) {
          acc[batchYear][major] = [];
        }
        acc[batchYear][major].push(alum);
        return acc;
      }, {});

      // Sort batches (descending) and majors (alphabetically)
      const sortedGroupedAlumni = Object.keys(groupedAlumni)
        .sort((a, b) => (b === "Unknown" ? -1 : a === "Unknown" ? 1 : b - a))
        .reduce((acc, batchKey) => {
          const majors = Object.keys(groupedAlumni[batchKey]).sort((a, b) =>
            b === "Unknown" ? -1 : a === "Unknown" ? 1 : a.localeCompare(b)
          );
          acc[batchKey] = majors.reduce((majorAcc, majorKey) => {
            majorAcc[majorKey] = groupedAlumni[batchKey][majorKey];
            return majorAcc;
          }, {});
          return acc;
        }, {});

      return res.status(200).json(sortedGroupedAlumni);
    }

    if (groupByBatch === "true") {
      // Group by batch only
      const alumni = await Alumni.find().select("-__v");
      if (alumni.length === 0) {
        return res.status(200).json({});
      }
      const groupedAlumni = alumni.reduce((acc, alum) => {
        const batchYear = alum.batch || "Unknown";
        if (!acc[batchYear]) {
          acc[batchYear] = [];
        }
        acc[batchYear].push(alum);
        return acc;
      }, {});

      // Sort batches in descending order
      const sortedGroupedAlumni = Object.keys(groupedAlumni)
        .sort((a, b) => (b === "Unknown" ? -1 : a === "Unknown" ? 1 : b - a))
        .reduce((acc, key) => {
          acc[key] = groupedAlumni[key];
          return acc;
        }, {});

      return res.status(200).json(sortedGroupedAlumni);
    }

    // Return all alumni without grouping
    const alumni = await Alumni.find().select("-__v");
    res.status(200).json(alumni);
  } catch (err) {
    console.error("Failed to fetch alumni:", err);
    res.status(500).json({ message: "Failed to fetch alumni" });
  }
});

// @route   GET /api/alumni/listings
// @desc    Get alumni list for frontend listings
// @access  Public
router.get("/listings", async (_req, res) => {
  try {
    const alumni = await Alumni.find().select(
      "name photoURL currentJobTitle company skills graduationYear major userId"
    );
    res.status(200).json(alumni);
  } catch (err) {
    console.error("Error fetching alumni listings:", err);
    res.status(500).json({ message: "Could not fetch alumni listings" });
  }
});

// @route   GET /api/alumni/:userId
// @desc    Get alumni by userId
// @access  Public
router.get("/:userId", async (req, res) => {
  try {
    const alum = await Alumni.findOne({ userId: req.params.userId });
    if (!alum) return res.status(404).json({ message: "Alumni not found" });
    res.status(200).json(alum);
  } catch (err) {
    console.error("Error getting alumni:", err);
    res.status(500).json({ message: "Error fetching alumni data" });
  }
});

// @route   POST /api/alumni/:userId
// @desc    Create new alumni by Firebase userId
// @access  Private
router.post("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.uid !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const existing = await Alumni.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Alumni profile already exists" });
    }

    const newAlumni = new Alumni({ userId, ...req.body });
    const saved = await newAlumni.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating alumni:", err);
    res.status(500).json({ message: "Could not create alumni data" });
  }
});

// @route   PUT /api/alumni/:userId
// @desc    Update alumni profile by userId
// @access  Private
router.put("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.uid !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await Alumni.findOneAndUpdate(
      { userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Alumni not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating alumni:", err);
    res.status(500).json({ message: "Failed to update alumni profile" });
  }
});

// @route   GET /api/alumni/debug
// @desc    Debug endpoint to inspect batch and major fields
// @access  Public
router.get("/debug", async (_req, res) => {
  try {
    const alumni = await Alumni.find().select("batch major userId name");
    const summary = alumni.map(alum => ({
      userId: alum.userId,
      name: alum.name,
      batch: alum.batch || "Missing",
      major: alum.major || "Missing",
    }));
    res.status(200).json(summary);
  } catch (err) {
    console.error("Error fetching debug data:", err);
    res.status(500).json({ message: "Error fetching debug data" });
  }
});

export default router; 
