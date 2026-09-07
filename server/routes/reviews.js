const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");
const { fallbackReviews } = require("../data/fallbackProperties");

const router = express.Router();

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

// CREATE REVIEW (only if user booked the property)
router.post("/", auth, async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    if (!propertyId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isDBConnected()) {
      const mockReview = {
        _id: "rev-" + Date.now(),
        user: { name: req.user.name || "Guest Traveler" },
        property: propertyId,
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };
      return res.status(201).json(mockReview);
    }

    // Check if user booked this property
    const booking = await Booking.findOne({
      user: req.user.id,
      property: propertyId,
    });

    if (!booking) {
      return res
        .status(403)
        .json({ message: "You can review only properties you booked" });
    }

    // Prevent duplicate review by same user
    const existingReview = await Review.findOne({
      user: req.user.id,
      property: propertyId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You already reviewed this property" });
    }

    const review = await Review.create({
      user: req.user.id,
      property: propertyId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET REVIEWS FOR A PROPERTY (public)
router.get("/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!isDBConnected() || propertyId.startsWith("demo-prop-")) {
      const demoRev = fallbackReviews[propertyId] || [];
      return res.json(demoRev);
    }

    const reviews = await Review.find({
      property: propertyId,
    }).populate("user", "name");

    res.json(reviews || []);
  } catch (err) {
    console.error("Error fetching reviews:", err.message);
    const demoRev = fallbackReviews[req.params.propertyId] || [];
    res.json(demoRev);
  }
});

module.exports = router;
