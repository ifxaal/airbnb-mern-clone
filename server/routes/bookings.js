const express = require("express");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE BOOKING
router.post("/", auth, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
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

    // 💰 Calculate total price
    const nights =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

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
    const bookings = await Booking.find({ user: req.user.id })
      .populate("property");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET BOOKINGS FOR A PROPERTY
router.get("/property/:propertyId", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      property: req.params.propertyId,
    })
      .populate("user", "name email");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
