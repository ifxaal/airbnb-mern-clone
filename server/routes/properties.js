const upload = require("../middleware/upload");
const express = require("express");
const Property = require("../models/Property");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      pricePerNight: req.body.pricePerNight,
      image: req.file
        ? `/uploads/${req.file.filename}`
        : "",
      owner: req.user.id,
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const { location, minPrice, maxPrice, sortOrder } = req.query;


    let query = {};
    let sortOption = {};

if (sortOrder === "low") {
  sortOption.pricePerNight = 1;
} else if (sortOrder === "high") {
  sortOption.pricePerNight = -1;
}


    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).sort(sortOption);

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.get("/my", auth, async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user.id,
    });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedProperty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }


    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
