require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Property = require("./models/Property");
const { fallbackProperties } = require("./data/fallbackProperties");

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Error: MONGO_URI is not defined in server/.env");
    process.exit(1);
  }

  console.log("⏳ Connecting to MongoDB...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("✅ Connected to MongoDB Atlas");

    // Create or find demo host user
    let host = await User.findOne({ email: "host@stayease.com" });
    if (!host) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("StayEase@2026", salt);
      host = await User.create({
        name: "StayEase Superhost",
        email: "host@stayease.com",
        password: hashedPassword,
      });
      console.log("👤 Created demo host user: host@stayease.com (password: StayEase@2026)");
    } else {
      console.log("👤 Using existing demo host:", host.email);
    }

    // Remove existing demo properties or seed if empty
    const existingCount = await Property.countDocuments();
    console.log(`📊 Current properties in database: ${existingCount}`);

    const propertiesToInsert = fallbackProperties.map((p) => ({
      title: p.title,
      description: p.description,
      location: p.location,
      pricePerNight: p.pricePerNight,
      image: p.image,
      images: p.images,
      owner: host._id,
    }));

    // Insert properties
    const inserted = await Property.insertMany(propertiesToInsert);
    console.log(`🎉 Successfully seeded ${inserted.length} premium properties!`);

    console.log("\nSample seeded listings:");
    inserted.forEach((p, i) => {
      console.log(` ${i + 1}. [${p.location}] ${p.title} - ₹${p.pricePerNight}/night`);
    });

    console.log("\n✨ Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
