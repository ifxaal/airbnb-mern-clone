const express = require("express");
const mongoose = require("mongoose");
const upload = require("../middleware/upload");
const Property = require("../models/Property");
const auth = require("../middleware/authMiddleware");
const { fallbackProperties } = require("../data/fallbackProperties");

const router = express.Router();

function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

// Helper to filter fallback demo data
function filterFallback(query) {
  let list = [...fallbackProperties];
  const { location, minPrice, maxPrice, sortOrder, category } = query;

  if (location && location.trim()) {
    const locLower = location.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.location.toLowerCase().includes(locLower) ||
        p.title.toLowerCase().includes(locLower)
    );
  }

  if (category && category !== "All") {
    const catLower = category.toLowerCase();
    list = list.filter(
      (p) => p.category && p.category.toLowerCase() === catLower
    );
  }

  if (minPrice) {
    list = list.filter((p) => p.pricePerNight >= Number(minPrice));
  }

  if (maxPrice) {
    list = list.filter((p) => p.pricePerNight <= Number(maxPrice));
  }

  if (sortOrder === "low") {
    list.sort((a, b) => a.pricePerNight - b.pricePerNight);
  } else if (sortOrder === "high") {
    list.sort((a, b) => b.pricePerNight - a.pricePerNight);
  }

  return list;
}

// CREATE PROPERTY
router.post("/", auth, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.warn("Upload middleware warning:", err.message);
      // Continue anyway; user may have provided image URL in body
    }
    next();
  });
}, async (req, res) => {
  try {
    const imageUrl = req.file
      ? (req.file.path || `/uploads/${req.file.filename}`)
      : (req.body.image || "");

    if (!isDBConnected()) {
      // In offline/demo mode, return a mocked created property
      const mockedProp = {
        _id: "prop-" + Date.now(),
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        pricePerNight: Number(req.body.pricePerNight),
        image: imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        images: [imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"],
        owner: req.user.id,
        createdAt: new Date()
      };
      return res.status(201).json(mockedProp);
    }

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      pricePerNight: req.body.pricePerNight,
      image: imageUrl,
      images: imageUrl ? [imageUrl] : [],
      owner: req.user.id,
    });

    res.status(201).json(property);
  } catch (err) {
    console.error("Error creating property:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET ALL PROPERTIES (with search, filters, sorting & resilient fallback)
router.get("/", async (req, res) => {
  try {
    const { location, minPrice, maxPrice, sortOrder, category } = req.query;

    if (!isDBConnected()) {
      console.warn("ℹ️ Database offline; serving fallback properties");
      return res.json(filterFallback(req.query));
    }

    let query = {};
    let sortOption = {};

    if (sortOrder === "low") {
      sortOption.pricePerNight = 1;
    } else if (sortOrder === "high") {
      sortOption.pricePerNight = -1;
    } else {
      sortOption.createdAt = -1;
    }

    if (location && location.trim()) {
      query.$or = [
        { location: { $regex: location.trim(), $options: "i" } },
        { title: { $regex: location.trim(), $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).sort(sortOption);

    // If database connected but empty, serve curated showcase properties
    if (!properties || properties.length === 0) {
      return res.json(filterFallback(req.query));
    }

    res.json(properties);
  } catch (err) {
    console.error("Error fetching properties, falling back to demo data:", err.message);
    res.json(filterFallback(req.query));
  }
});

// GET MY PROPERTIES
router.get("/my", auth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json([]);
    }

    const properties = await Property.find({
      owner: req.user.id,
    });

    res.json(properties);
  } catch (err) {
    console.error("Error fetching user properties:", err.message);
    res.json([]);
  }
});

// GET PROPERTY BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check fallback list first if id is demo
    if (id.startsWith("demo-prop-")) {
      const found = fallbackProperties.find((p) => p._id === id);
      if (found) return res.json(found);
    }

    if (!isDBConnected()) {
      const found = fallbackProperties.find((p) => p._id === id);
      if (found) return res.json(found);
      return res.status(404).json({ message: "Property not found" });
    }

    // Try finding in Mongo
    if (mongoose.Types.ObjectId.isValid(id)) {
      const property = await Property.findById(id).populate(
        "owner",
        "name email"
      );
      if (property) {
        return res.json(property);
      }
    }

    // Fallback search
    const foundFallback = fallbackProperties.find((p) => p._id === id);
    if (foundFallback) {
      return res.json(foundFallback);
    }

    res.status(404).json({ message: "Property not found" });
  } catch (err) {
    console.error("Error fetching property by ID:", err.message);
    const found = fallbackProperties.find((p) => p._id === req.params.id);
    if (found) return res.json(found);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROPERTY
router.put("/:id", auth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json({ _id: req.params.id, ...req.body });
    }

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

// DELETE PROPERTY
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json({ message: "Property deleted successfully (demo mode)" });
    }

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
