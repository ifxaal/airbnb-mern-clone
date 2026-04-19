import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getImageSrc } from "../api/axios";
function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const handleDelete = async (id) => {
    if (!window.confirm("Delete property?")) return;
    setError("");
    try {
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed. Please try again.");
    }
  };


  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    api
      .get("/properties/my", { signal: controller.signal })
      .then((res) => {
        if (!isMounted) return;
        setProperties(res.data || []);
      })
      .catch((err) => {
        if (!isMounted || err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        setError("Could not load your listings right now.");
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

  const listingsCount = properties.length;
  const avgNightly = listingsCount
    ? Math.round(properties.reduce((sum, p) => sum + Number(p.pricePerNight || 0), 0) / listingsCount)
    : 0;

  return (
    <div>
      <h2 className="page-title">My Properties</h2>
      <div className="dashboard-grid">
        <div className="panel stat-card">
          <p className="muted" style={{ margin: 0 }}>Active Listings</p>
          <h3 style={{ margin: "0.4rem 0 0" }}>{listingsCount}</h3>
        </div>
        <div className="panel stat-card">
          <p className="muted" style={{ margin: 0 }}>Average Nightly Price</p>
          <h3 style={{ margin: "0.4rem 0 0" }}>₹{avgNightly}</h3>
        </div>
      </div>

      {error && <p className="status-error">{error}</p>}
      {!error && properties.length === 0 && (
        <div className="empty-state">
          <p className="muted" style={{ marginBottom: "0.7rem" }}>You do not have any listings yet.</p>
          <Link to="/create" className="button button-primary">Create your first listing</Link>
        </div>
      )}

      <div className="grid">
        {properties.map((p, index) => {
          const fallbackImages = ["/images/house1.jpg", "/images/house2.jpg", "/images/house3.jpg"];
          return (
            <div
              key={p._id}
              className="property-card"
            >
              <img
                src={
                  p.image
                    ? getImageSrc(p.image)
                    : p.images && p.images.length > 0
                    ? getImageSrc(p.images[0])
                    : fallbackImages[index % fallbackImages.length]
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImages[index % fallbackImages.length];
                }}
                alt={p.title}
              />




            <div className="property-card-body">
              <h3 className="property-title">{p.title}</h3>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>{p.location}</p>
              <p className="price">₹{p.pricePerNight} / night</p>
              <button
                onClick={() => handleDelete(p._id)}
                className="button button-danger"
                style={{ marginTop: "0.8rem", width: "100%" }}
              >
                Delete
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
    
  );
}

export default MyProperties;
