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
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (!form.description.trim() || form.description.trim().length < 20) {
      nextErrors.description = "Description should be at least 20 characters.";
    }
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
      nextErrors.pricePerNight = "Price must be greater than zero.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Create Property</h2>

      <form onSubmit={handleSubmit} className="panel" style={{ padding: "1.2rem", display: "grid", gap: "0.75rem", maxWidth: "720px" }}>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          required
          className="input"
        />
        {errors.title && <p className="status-error">{errors.title}</p>}

        <input
          name="location"
          placeholder="Location"
          onChange={handleChange}
          required
          className="input"
        />
        {errors.location && <p className="status-error">{errors.location}</p>}

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
          className="textarea"
        />
        {errors.description && <p className="status-error">{errors.description}</p>}

        <input
          type="number"
          name="pricePerNight"
          placeholder="Price per night"
          onChange={handleChange}
          required
          className="input"
        />
        {errors.pricePerNight && <p className="status-error">{errors.pricePerNight}</p>}

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          accept="image/*"
          className="input"
        />
        <button type="submit" className="button button-primary" style={{ width: "fit-content" }}>
          {submitting ? "Creating..." : "Create"}
        </button>
      </form>

      {message && <p className="status-error">{message}</p>}
    </div>
  );
}

export default CreateProperty;
