import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getImageSrc } from "../api/axios";
import { fallbackProperties } from "../data/fallbackProperties";

function PropertyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    }
    return property?.rating || "4.9";
  }, [reviews, property]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadPage = async () => {
      setLoading(true);
      setPageError("");
      try {
        const [propertyRes, bookingsRes, reviewsRes, meRes] = await Promise.allSettled([
          api.get(`/properties/${id}`, { signal: controller.signal }),
          api.get(`/bookings/property/${id}`, { signal: controller.signal }),
          api.get(`/reviews/property/${id}`, { signal: controller.signal }),
          api.get("/auth/me", { signal: controller.signal }),
        ]);

        if (!isMounted) return;

        if (propertyRes.status === "fulfilled" && propertyRes.value?.data) {
          setProperty(propertyRes.value.data);
        } else {
          // Check fallback
          const fallback = fallbackProperties.find((p) => p._id === id);
          if (fallback) {
            setProperty(fallback);
          } else {
            setPageError("Unable to load this property.");
          }
        }

        if (bookingsRes.status === "fulfilled") {
          const today = new Date();
          const booked = (bookingsRes.value.data || []).some((b) => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            return today >= start && today <= end;
          });
          setIsAvailable(!booked);
        }

        if (reviewsRes.status === "fulfilled") {
          setReviews(reviewsRes.value.data || []);
        }

        if (meRes.status === "fulfilled") {
          setCurrentUser(meRes.value.data);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        const fallback = fallbackProperties.find((p) => p._id === id);
        if (fallback) {
          setProperty(fallback);
        } else if (isMounted) {
          setPageError("Unable to load this property.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPage();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const minStartDate = new Date().toISOString().split("T")[0];
  const minEndDate = startDate || minStartDate;
  const nights = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
    : 0;
  const estimatedTotal = property ? nights * Number(property.pricePerNight || 0) : 0;
  const serviceFee = Math.round(estimatedTotal * 0.08);
  const grandTotal = estimatedTotal + serviceFee;

  const handleBooking = async () => {
    setBookingError("");
    setBookingMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setBookingError("Please login to book this property.");
      return;
    }
    if (!startDate || !endDate) {
      setBookingError("Please select both check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      setBookingError("Check-out date must be after check-in date.");
      return;
    }

    try {
      setSubmittingBooking(true);
      await api.post("/bookings", {
        propertyId: property._id,
        startDate,
        endDate,
      });
      setBookingMessage("🎉 Booking successful! You can view it in My Bookings.");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleReview = async () => {
    setReviewError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setReviewError("Please login to add a review.");
      return;
    }
    if (!comment.trim()) {
      setReviewError("Review comment cannot be empty.");
      return;
    }

    try {
      setSubmittingReview(true);
      await api.post("/reviews", {
        propertyId: id,
        rating,
        comment,
      });

      const res = await api.get(`/reviews/property/${id}`);
      setReviews(res.data || []);
      setComment("");
    } catch (err) {
      setReviewError(err.response?.data?.message || "Review failed.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await api.delete(`/properties/${property._id}`);
      navigate("/");
    } catch (err) {
      setPageError("Delete failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="loading-block" style={{ height: "360px" }} />
        <div className="loading-block" style={{ height: "180px" }} />
      </div>
    );
  }

  if (!property) return <p className="status-error">{pageError || "Property not found."}</p>;

  const defaultAmenities = [
    "High-speed Wi-Fi",
    "Air Conditioning",
    "Dedicated Workspace",
    "Fully Equipped Kitchen",
    "Free Parking",
    "Swimming Pool / View",
  ];
  const displayAmenities = property.amenities || defaultAmenities;

  const mainImage = property.image
    ? getImageSrc(property.image)
    : property.images && property.images.length > 0
    ? getImageSrc(property.images[0])
    : "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

  const sideImages = property.images && property.images.length > 1
    ? property.images.slice(1, 3).map((img) => getImageSrc(img))
    : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
      ];

  const isOwner = currentUser && (
    (typeof property.owner === "string" && property.owner === currentUser._id) ||
    (property.owner && property.owner._id === currentUser._id)
  );

  return (
    <div className="detail-container">
      {/* NAVIGATION / BREADCRUMB */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          className="button button-outline"
          onClick={() => navigate(-1)}
          style={{ padding: "0.45rem 0.85rem", fontSize: "0.88rem" }}
        >
          ← Back to stays
        </button>
        {isOwner && (
          <button
            type="button"
            className="button button-danger"
            onClick={handleDelete}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.88rem" }}
          >
            Delete Property
          </button>
        )}
      </div>

      {/* HEADER INFO */}
      <div>
        <h1 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800 }}>
          {property.title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", color: "var(--muted)", fontSize: "0.92rem" }}>
          <span>⭐ {averageRating} ({reviews.length > 0 ? `${reviews.length} reviews` : "New"})</span>
          <span>•</span>
          <span>📍 {property.location}</span>
          <span>•</span>
          <span style={{ color: isAvailable ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
            {isAvailable ? "● Available to book" : "● Currently Booked"}
          </span>
        </div>
      </div>

      {/* PHOTO GALLERY */}
      <div className="detail-gallery">
        <img
          src={mainImage}
          alt={property.title}
          className="detail-main-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div className="detail-side-gallery">
          {sideImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${property.title} detail ${i + 1}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
              }}
            />
          ))}
        </div>
      </div>

      {/* MAIN CONTENT & BOOKING SIDEBAR */}
      <div className="detail-content-layout">
        {/* LEFT COLUMN: DESCRIPTION & AMENITIES */}
        <div>
          <div className="panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.2rem", fontWeight: 700 }}>About this stay</h3>
            <p style={{ margin: 0, color: "var(--ink-secondary)", lineHeight: 1.65, fontSize: "0.98rem" }}>
              {property.description}
            </p>
          </div>

          <div className="panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 0.85rem", fontSize: "1.2rem", fontWeight: 700 }}>What this place offers</h3>
            <div className="amenities-list">
              {displayAmenities.map((amenity, idx) => (
                <span key={idx} className="amenity-chip">
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <div className="panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1.2rem", fontWeight: 700 }}>
              Guest Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p className="muted" style={{ margin: "0 0 1rem" }}>No reviews yet for this listing.</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-card">
                  <div className="review-author-row">
                    <div className="avatar">
                      {r.user?.name ? r.user.name[0].toUpperCase() : "G"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                        {r.user?.name || "Guest Traveler"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {"★".repeat(r.rating || 5)} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent stay"}
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: "0.4rem 0 0", color: "var(--ink-secondary)", fontSize: "0.9rem" }}>
                    {r.comment}
                  </p>
                </div>
              ))
            )}

            {/* LEAVE A REVIEW */}
            <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
              <h4 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Leave a Review</h4>
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Rating:</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="select"
                  style={{ width: "120px" }}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Share your experience at this property..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="textarea"
                style={{ marginBottom: "0.75rem" }}
              />
              {reviewError && <p className="status-error" style={{ marginBottom: "0.5rem" }}>{reviewError}</p>}
              <button
                type="button"
                className="button button-primary"
                onClick={handleReview}
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING CARD */}
        <aside className="booking-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>
                ₹{Number(property.pricePerNight).toLocaleString("en-IN")}
              </span>
              <span className="price-unit"> / night</span>
            </div>
            <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
              ⭐ {averageRating}
            </span>
          </div>

          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.25rem" }}>
                CHECK-IN
              </label>
              <input
                type="date"
                min={minStartDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.25rem" }}>
                CHECK-OUT
              </label>
              <input
                type="date"
                min={minEndDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="price-breakdown">
              <div className="price-row">
                <span>₹{Number(property.pricePerNight).toLocaleString("en-IN")} × {nights} nights</span>
                <span>₹{estimatedTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-row">
                <span>Service & Maintenance fee</span>
                <span>₹{serviceFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="price-row total">
                <span>Total before taxes</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {bookingError && <p className="status-error" style={{ marginBottom: "0.75rem" }}>{bookingError}</p>}
          {bookingMessage && (
            <p style={{ color: "var(--success)", fontSize: "0.88rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
              {bookingMessage}
            </p>
          )}

          <button
            type="button"
            className="button button-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
            onClick={handleBooking}
            disabled={submittingBooking || !isAvailable}
          >
            {submittingBooking
              ? "Reserving..."
              : !isAvailable
              ? "Dates Unavailable"
              : nights > 0
              ? `Reserve for ₹${grandTotal.toLocaleString("en-IN")}`
              : "Check Availability"}
          </button>

          <p className="muted" style={{ textAlign: "center", fontSize: "0.8rem", margin: "0.75rem 0 0" }}>
            You won't be charged yet. Instant confirmation.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default PropertyDetail;
