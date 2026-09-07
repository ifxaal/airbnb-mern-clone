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
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const sampleImages = [
    { label: "Beachfront Villa", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" },
    { label: "Mountain Cabin", url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80" },
    { label: "Heritage Haveli", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" },
    { label: "Modern Apartment", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "imageUrl") {
      setPreviewUrl(value);
      setImageFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const selectSample = (url) => {
    setForm((prev) => ({ ...prev, imageUrl: url }));
    setPreviewUrl(url);
    setImageFile(null);
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

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (form.imageUrl) {
        formData.append("image", form.imageUrl);
      }

      await api.post("/properties", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/my-properties");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create property.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        List a Property
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Enter details to publish your stay on StayEase.
      </p>

      <form onSubmit={handleSubmit} className="panel" style={{ padding: "1.5rem" }}>
        <div className="form-group">
          <label className="form-label">Property Title</label>
          <input
            name="title"
            placeholder="e.g. Coastal Breeze Villa"
            value={form.title}
            onChange={handleChange}
            required
            className="input"
          />
          {errors.title && <p className="status-error">{errors.title}</p>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0.75rem" }}>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              name="location"
              placeholder="e.g. Goa"
              value={form.location}
              onChange={handleChange}
              required
              className="input"
            />
            {errors.location && <p className="status-error">{errors.location}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Price per Night (₹)</label>
            <input
              type="number"
              name="pricePerNight"
              placeholder="e.g. 5000"
              value={form.pricePerNight}
              onChange={handleChange}
              required
              className="input"
            />
            {errors.pricePerNight && <p className="status-error">{errors.pricePerNight}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe the rooms, views, amenities, and surroundings..."
            value={form.description}
            onChange={handleChange}
            required
            className="textarea"
          />
          {errors.description && <p className="status-error">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Property Image</label>
          <input
            type="url"
            name="imageUrl"
            placeholder="Image URL (Unsplash or direct link)"
            value={form.imageUrl}
            onChange={handleChange}
            className="input"
            style={{ marginBottom: "0.5rem" }}
          />

          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center" }}>Sample photos:</span>
            {sampleImages.map((s, i) => (
              <button
                key={i}
                type="button"
                className="button button-outline"
                style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                onClick={() => selectSample(s.url)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Or upload:</span>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="input"
              style={{ padding: "0.35rem" }}
            />
          </div>
        </div>

        {previewUrl && (
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
              Preview:
            </span>
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }}
              onError={() => setPreviewUrl("")}
            />
          </div>
        )}

        {message && <p className="status-error" style={{ marginBottom: "0.75rem" }}>{message}</p>}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProperty;
