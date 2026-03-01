import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function PropertyDetail() {
  const [currentUser, setCurrentUser] = useState(null);
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
const [rating, setRating] = useState(5);
const [comment, setComment] = useState("");
const [isAvailable, setIsAvailable] = useState(true);





const averageRating =
  reviews.length > 0
    ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) /
        reviews.length
      ).toFixed(1)
    : null;


  

  useEffect(() => {
  api.get(`/properties/${id}`).then((res) => {
    setProperty(res.data);
  });

  api.get(`/bookings/property/${id}`)
  .then((res) => {
    const today = new Date();

    const booked = res.data.some((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return today >= start && today <= end;
    });

    setIsAvailable(!booked);
  })
  .catch(() => {});


  api.get(`/reviews/property/${id}`).then((res) => {
    setReviews(res.data);
  });

  api.get("/auth/me")
  .then((res) => setCurrentUser(res.data))
  .catch(() => {});

}, [id]);


  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const isLoggedIn = !!localStorage.getItem("token");

const handleBooking = async () => {
  const token = localStorage.getItem("token");
if (!token) {
  alert("Please login to book this property");
  return;
}

  if (!startDate || !endDate) {
    alert("Please select dates");
    return;
  }

  if (new Date(startDate) >= new Date(endDate)) {
    alert("End date must be after start date");
    return;
  }

  try {
    await api.post("/bookings", {
      propertyId: property._id,
      startDate,
      endDate,
    });

    alert("Booking successful");
  } catch (err) {
    alert(err.response?.data?.message || "Booking failed");
  }
};
const handleReview = async () => {
  const token = localStorage.getItem("token");
if (!token) {
  alert("Please login to add review");
  return;
}

  try {
    await api.post("/reviews", {
      propertyId: id,
      rating,
      comment,
    });

    alert("Review added");

    const res = await api.get(`/reviews/property/${id}`);
    setReviews(res.data);

    setComment("");
  } catch (err) {
    alert(err.response?.data?.message || "Review failed");
  }
};


const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this property?"))
    return;

  try {
    await api.delete(`/properties/${property._id}`);
    alert("Property deleted");
    window.location.href = "/";
  } catch (err) {
    alert("Delete failed");
  }
};




  if (!property) return <p>Loading...</p>;
  

  return (
  <div style={{ 
  maxWidth: "1000px", 
  margin: "0 auto", 
  padding: "40px 20px",
  background: "#fff",
  borderRadius: "16px"
}}>

    
    {/* IMAGE */}
    <img
      src={
        property.image
          ? `http://localhost:5000${property.image}`
          : property.images && property.images.length > 0
          ? property.images[0]
          : "https://picsum.photos/800/400"
      }
      alt={property.title}
      style={{
        width: "100%",
        height: "450px",
        objectFit: "cover",
        borderRadius: "20px",
        marginBottom: "30px",
      }}
    />

    {/* TITLE */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "600" }}>
        {property.title}
      </h1>

      {currentUser && property.owner?._id === currentUser._id && (
  <button
    onClick={handleDelete}
    style={{
      padding: "8px 16px",
      background: "#ff4d4f",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
    }}
  >
    Delete
  </button>

  
)}


    </div>

    <p style={{ color: "#717171", marginBottom: "15px" }}>
      📍 {property.location}
    </p>

    <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>
      {property.description}
    </p>

    <div style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "25px" }}>
      ₹{property.pricePerNight} / night
    </div>
    

    {/* BOOKING SECTION */}
    <div style={{
      border: "1px solid #eee",
      padding: "20px",
      borderRadius: "16px",
      marginBottom: "40px"
    }}>
      <h3 style={{ marginBottom: "15px" }}>Book Your Stay</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Start Date:</label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginLeft: "10px", padding: "6px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginLeft: "20px", padding: "6px" }}
        />
      </div>
{!isAvailable && (
  <p style={{ color: "red", marginTop: "10px" }}>
    ❌ Currently Not Available
  </p>
)}

      <button
  onClick={handleBooking}
  disabled={!isAvailable}
  style={{
    marginTop: "20px",
    padding: "14px 28px",
    background: isAvailable ? "#000" : "#999",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: isAvailable ? "pointer" : "not-allowed",
  }}
>
  {isAvailable ? "Book Now" : "Not Available"}
</button>


    </div>

    {/* REVIEWS SECTION */}
    <hr style={{ margin: "40px 0" }} />

    <h2 style={{ marginBottom: "20px" }}>Reviews</h2>

    {reviews.length === 0 && <p>No reviews yet.</p>}

    {reviews.map((r) => (
      <div
        key={r._id}
        style={{
          border: "1px solid #eee",
          padding: "15px",
          marginBottom: "15px",
          borderRadius: "12px",
          background: "#fafafa"
        }}
      >
        <strong>{r.user?.name}</strong>
        <p style={{ margin: "5px 0" }}>⭐ {r.rating} / 5</p>
        <p>{r.comment}</p>
      </div>
    ))}
    <h2 style={{ marginBottom: "10px" }}>
  Reviews {averageRating && `• ⭐ ${averageRating} (${reviews.length})`}
</h2>


    {/* ADD REVIEW */}
    <div style={{
      border: "1px solid #eee",
      padding: "20px",
      borderRadius: "16px",
      marginTop: "30px"
    }}>
      <h3 style={{ marginBottom: "15px" }}>Add Review</h3>

      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        style={{ padding: "6px", marginBottom: "10px" }}
      >
        <option value="5">5</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
      </select>

      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}
      />

      <button
        onClick={handleReview}
        style={{
          padding: "10px 20px",
          background: "black",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Submit Review
      </button>
    </div>

  </div>
);


}

export default PropertyDetail;
