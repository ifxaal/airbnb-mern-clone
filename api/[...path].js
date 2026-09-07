const app = require("../server/app");
const connectDB = require("../server/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Vercel API DB connection warning:", err.message);
  }
  return app(req, res);
};
