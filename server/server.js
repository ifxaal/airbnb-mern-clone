require("dotenv").config();
const app = require("./app");
const connectDB = require("./db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => console.error(err));
