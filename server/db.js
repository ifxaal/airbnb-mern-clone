const mongoose = require("mongoose");

let cachedConnection = null;
let connectionPromise = null;

async function connectDB() {
  if (cachedConnection) return cachedConnection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(process.env.MONGO_URI).then((m) => {
    cachedConnection = m.connection;
    return cachedConnection;
  });

  return connectionPromise;
}

module.exports = connectDB;
