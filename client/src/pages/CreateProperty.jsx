import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    pricePerNight: "",
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("location", form.location);
      formData.append("description", form.description);
      formData.append("pricePerNight", form.pricePerNight);

      if (image) {
        formData.append("image", image);
      }

      await api.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/my-properties");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to create property"
      );
    }
  };

  return (
    <div>
      <h2>Create Property</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="pricePerNight"
          placeholder="Price per night"
          onChange={handleChange}
          required
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          accept="image/*"
        />

        <br /><br />

        <button type="submit">Create</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateProperty;
