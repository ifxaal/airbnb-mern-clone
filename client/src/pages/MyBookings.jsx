import { useEffect, useState } from "react";
import api from "../api/axios";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings/my")
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.length === 0 && <p>No bookings yet.</p>}

      {bookings.map((booking) => (
        <div
  key={booking._id}
  style={{
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "15px",
    background: "#fafafa"
  }}
>
  <h3>{booking.property?.title}</h3>
  <p style={{ color: "#777" }}>
    📍 {booking.property?.location}
  </p>
  <p>
    🗓 {booking.startDate.slice(0, 10)} → {booking.endDate.slice(0, 10)}
  </p>
  <p style={{ fontWeight: "bold" }}>
    ₹{booking.totalPrice}
  </p>
</div>

      ))}
    </div>
  );
}

export default MyBookings;
