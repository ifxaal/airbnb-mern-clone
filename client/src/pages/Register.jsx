import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/register", form);
      setSuccess("Registered successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: "460px", margin: "1rem auto", padding: "1.2rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <h2 className="page-title" style={{ marginBottom: "0.2rem" }}>Create Your Account</h2>
        <p className="muted" style={{ margin: 0 }}>Join StayEase and manage your stays in one place.</p>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="input"
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="input"
        />
        {error && <p className="status-error">{error}</p>}
        {success && <p className="status-success">{success}</p>}
        <button type="submit" className="button button-primary">
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;
