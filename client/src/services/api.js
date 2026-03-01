import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
api.post("/properties", {
  title,
  location,
  pricePerNight,
  image
});

export default api;
