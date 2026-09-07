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
  const serviceFee = Math.round(estimatedTotal * 0.05);
  const grandTotal = estimatedTotal + serviceFee;

  const handleBooking = async () => {
    setBookingError("");
    setBookingMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setBookingError("Please log in to book this property.");
      return;
    }
    if (!startDate || !endDate) {
      setBookingError("Please select check-in and check-out dates.");
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
      setBookingMessage("Booking confirmed. You can view details in My Bookings.");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking request failed. Please try again.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleReview = async () => {
    setReviewError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setReviewError("Please log in to write a review.");
      return;
    }
    if (!comment.trim()) {
      setReviewError("Comment cannot be empty.");
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
      setReviewError(err.response?.data?.message || "Could not submit review.");
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
        <div className="loading-block" style={{ height: "300px" }} />
        <div className="loading-block" style={{ height: "150px" }} />
      </div>
    );
  }

  if (!property) return <p className="status-error">{pageError || "Property not found."}</p>;

  const defaultAmenities = [
    "Wi-Fi",
    "Air conditioning",
    "Dedicated workspace",
    "Kitchen",
    "Free parking",
    "Hot water",
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
    <div className="detail-layout">
      {/* TOP NAVIGATION */}
      <div className="detail-top-nav">
        <button
          type="button"
          className="button button-outline"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        {isOwner && (
          <button
            type="button"
            className="button button-danger"
            onClick={handleDelete}
          >
            Delete Listing
          </button>
        )}
      </div>

      {/* TITLE & META */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          {property.title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          ★ {averageRating} ({reviews.length} reviews) · {property.location} · {isAvailable ? "Available" : "Booked"}
        </p>
      </div>

      {/* GALLERY */}
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
              alt={`${property.title} preview ${i + 1}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
              }}
            />
          ))}
        </div>
      </div>

      {/* CONTENT & BOOKING */}
      <div className="detail-columns">
        <div>
          {/* DESCRIPTION */}
          <div className="panel detail-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>About this place</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
              {property.description}
            </p>
          </div>

          {/* AMENITIES */}
          <div className="panel detail-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>Amenities</h3>
            <div className="amenities-container">
              {displayAmenities.map((amenity, idx) => (
                <span key={idx} className="amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* REVIEWS */}
          <div className="panel detail-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No reviews yet for this listing.</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-item">
                  <div className="review-user-row">
                    <div className="avatar-circle">
                      {r.user?.name ? r.user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {r.user?.name || "Guest"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        ★ {r.rating} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent"}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "0.3rem" }}>
                    {r.comment}
                  </p>
                </div>
              ))
            )}

            {/* LEAVE REVIEW */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 600, marginBottom: "0.5rem" }}>Leave a review</h4>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Rating:</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="select"
                  style={{ width: "110px", padding: "0.35rem 0.5rem" }}
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
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="textarea"
                style={{ marginBottom: "0.5rem" }}
              />
              {reviewError && <p className="status-error" style={{ marginBottom: "0.5rem" }}>{reviewError}</p>}
              <button
                type="button"
                className="button button-outline"
                onClick={handleReview}
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>

        {/* BOOKING SIDEBAR */}
        <div className="panel booking-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}>
            <div>
              <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                ₹{Number(property.pricePerNight).toLocaleString("en-IN")}
              </span>
              <span className="price-unit"> / night</span>
            </div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              ★ {averageRating}
            </span>
          </div>

          <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
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
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
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
            <div className="price-summary">
              <div className="summary-row">
                <span>₹{Number(property.pricePerNight).toLocaleString("en-IN")} × {nights} nights</span>
                <span>₹{estimatedTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row">
                <span>Service fee (5%)</span>
                <span>₹{serviceFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {bookingError && <p className="status-error" style={{ marginBottom: "0.5rem" }}>{bookingError}</p>}
          {bookingMessage && (
            <p style={{ color: "#059669", fontSize: "0.85rem", fontWeight: 500, margin: "0 0 0.5rem" }}>
              {bookingMessage}
            </p>
          )}

          <button
            type="button"
            className="button button-primary"
            style={{ width: "100%", padding: "0.65rem", fontSize: "0.95rem" }}
            onClick={handleBooking}
            disabled={submittingBooking || !isAvailable}
          >
            {submittingBooking
              ? "Processing..."
              : !isAvailable
              ? "Unavailable"
              : nights > 0
              ? `Reserve (₹${grandTotal.toLocaleString("en-IN")})`
              : "Check Availability"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
