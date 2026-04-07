import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    api.get("/bookings/my", { signal: controller.signal })
      .then((res) => {
        if (!isMounted) return;
        setBookings(res.data || []);
      })
      .catch((err) => {
        if (!isMounted || err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError("Could not load your bookings right now.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div className="loading-block" />
        <div className="loading-block" />
      </div>
    );
  }

  const totalBooked = bookings.length;
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);

  return (
    <div>
      <h2 className="page-title">My Bookings</h2>
      <div className="dashboard-grid">
        <div className="panel stat-card">
          <p className="muted" style={{ margin: 0 }}>Total Bookings</p>
          <h3 style={{ margin: "0.4rem 0 0" }}>{totalBooked}</h3>
        </div>
        <div className="panel stat-card">
          <p className="muted" style={{ margin: 0 }}>Total Spent</p>
          <h3 style={{ margin: "0.4rem 0 0" }}>₹{totalSpent}</h3>
        </div>
      </div>

      {error && <p className="status-error">{error}</p>}
      {!error && bookings.length === 0 && (
        <div className="empty-state">
          <p className="muted" style={{ marginBottom: "0.7rem" }}>No bookings yet.</p>
          <Link to="/properties" className="button button-primary">Explore stays</Link>
        </div>
      )}

      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="panel"
          style={{ padding: "1rem", marginBottom: "0.9rem" }}
        >
          <h3 className="property-title">{booking.property?.title}</h3>
          <p className="muted">📍 {booking.property?.location}</p>
          <p>🗓 {booking.startDate.slice(0, 10)} → {booking.endDate.slice(0, 10)}</p>
          <p className="price">₹{booking.totalPrice}</p>
        </div>

      ))}
    </div>
  );
}

export default MyBookings;
