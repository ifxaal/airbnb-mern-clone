const mongoose = require("mongoose");

let cachedConnection = null;
let connectionPromise = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("⚠️ MONGO_URI is not defined. Running in offline/fallback mode.");
    return null;
  }

  connectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    })
    .then((m) => {
      cachedConnection = m.connection;
      console.log("✅ MongoDB Connected successfully");
      return cachedConnection;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      // Reset connection promise on failure so next request can retry if DB resumes
      connectionPromise = null;
      cachedConnection = null;
      return null;
    });

  return connectionPromise;
}

module.exports = connectDB;
