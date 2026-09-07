const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const auth = require("../middleware/authMiddleware");
const { fallbackProperties } = require("../data/fallbackProperties");

const router = express.Router();

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

// CREATE BOOKING
router.post("/", auth, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    if (!isDBConnected() || propertyId.startsWith("demo-prop-")) {
      const demoProp = fallbackProperties.find((p) => p._id === propertyId);
      const pricePerNight = demoProp ? demoProp.pricePerNight : 5000;
      const mockBooking = {
        _id: "book-" + Date.now(),
        user: req.user.id,
        property: demoProp || { _id: propertyId, title: "StayEase Retreat", pricePerNight },
        startDate: start,
        endDate: end,
        totalPrice: nights * pricePerNight,
        status: "confirmed",
        createdAt: new Date()
      };
      return res.status(201).json(mockBooking);
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 🔒 Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
      ],
    });

    if (overlappingBooking) {
      return res
        .status(400)
        .json({ message: "Property already booked for these dates" });
    }

    const totalPrice = nights * property.pricePerNight;

    const booking = await Booking.create({
      user: req.user.id,
      property: propertyId,
      startDate: start,
      endDate: end,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET MY BOOKINGS
router.get("/my", auth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json([]);
    }

    const bookings = await Booking.find({ user: req.user.id })
      .populate("property");

    res.json(bookings || []);
  } catch (err) {
    console.error("Error fetching my bookings:", err.message);
    res.json([]);
  }
});

// GET BOOKINGS FOR A PROPERTY (public availability check)
router.get("/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!isDBConnected() || propertyId.startsWith("demo-prop-")) {
      return res.json([]);
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.json([]);
    }

    const bookings = await Booking.find({
      property: propertyId,
    }).select("startDate endDate");

    res.json(bookings || []);
  } catch (err) {
    console.error("Error fetching property bookings:", err.message);
    res.json([]);
  }
});

module.exports = router;
