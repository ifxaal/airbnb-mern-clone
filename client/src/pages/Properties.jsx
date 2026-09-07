import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageSrc } from "../api/axios";
import { fallbackProperties } from "../data/fallbackProperties";

const CATEGORIES = [
  { label: "All Stays", value: "All" },
  { label: "Beachfront", value: "Beachfront" },
  { label: "Mountain", value: "Mountain" },
  { label: "Heritage", value: "Heritage" },
  { label: "Nature", value: "Nature" },
  { label: "City Views", value: "Luxury" },
];

function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    sortOrder: "",
  });
  const [queryFilters, setQueryFilters] = useState(filters);
  const [filterError, setFilterError] = useState("");

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const min = Number(filters.minPrice || 0);
    const max = Number(filters.maxPrice || 0);

    if (filters.minPrice && min < 0) {
      setFilterError("Minimum price cannot be negative.");
      return;
    }
    if (filters.maxPrice && max < 0) {
      setFilterError("Maximum price cannot be negative.");
      return;
    }
    if (filters.minPrice && filters.maxPrice && min > max) {
      setFilterError("Minimum price must be less than or equal to maximum price.");
      return;
    }

    setFilterError("");
    setQueryFilters(filters);
  };

  const clearFilters = () => {
    const reset = { location: "", minPrice: "", maxPrice: "", sortOrder: "" };
    setFilters(reset);
    setQueryFilters(reset);
    setActiveCategory("All");
    setFilterError("");
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    api
      .get("/properties", {
        params: {
          location: queryFilters.location,
          minPrice: queryFilters.minPrice || undefined,
          maxPrice: queryFilters.maxPrice || undefined,
          sortOrder: queryFilters.sortOrder,
          category: activeCategory !== "All" ? activeCategory : undefined,
        },
        signal: controller.signal,
      })
      .then((res) => {
        if (!isMounted) return;
        if (res.data && res.data.length > 0) {
          setProperties(res.data);
        } else {
          let filtered = [...fallbackProperties];
          if (queryFilters.location) {
            const loc = queryFilters.location.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.location.toLowerCase().includes(loc) ||
                p.title.toLowerCase().includes(loc)
            );
          }
          if (activeCategory !== "All") {
            filtered = filtered.filter(
              (p) => p.category && p.category.toLowerCase() === activeCategory.toLowerCase()
            );
          }
          if (queryFilters.minPrice) {
            filtered = filtered.filter((p) => p.pricePerNight >= Number(queryFilters.minPrice));
          }
          if (queryFilters.maxPrice) {
            filtered = filtered.filter((p) => p.pricePerNight <= Number(queryFilters.maxPrice));
          }
          setProperties(filtered);
        }
      })
      .catch((err) => {
        if (!isMounted || err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        let filtered = [...fallbackProperties];
        if (queryFilters.location) {
          const loc = queryFilters.location.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.location.toLowerCase().includes(loc) ||
              p.title.toLowerCase().includes(loc)
          );
        }
        if (activeCategory !== "All") {
          filtered = filtered.filter(
            (p) => p.category && p.category.toLowerCase() === activeCategory.toLowerCase()
          );
        }
        setProperties(filtered);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [queryFilters, activeCategory]);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-section">
        <h1 className="hero-title">Discover Your Next Stay</h1>
        <p className="hero-subtext">
          Find and book unique vacation homes, chalets, and apartments with ease.
        </p>
      </section>

      {/* CATEGORY TABS */}
      <div className="category-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            className={`category-tab ${activeCategory === cat.value ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* SEARCH & FILTERS */}
      <section className="search-panel">
        <div className="filter-grid">
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search destination or property..."
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="input input-with-icon"
            />
          </div>
          <input
            type="number"
            placeholder="Min Price (₹)"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="input"
          />
          <input
            type="number"
            placeholder="Max Price (₹)"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="input"
          />
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            className="select"
          >
            <option value="">Sort by</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
        {filterError && <p className="status-error">{filterError}</p>}
        <div className="filter-actions">
          <button type="button" className="button button-outline" onClick={clearFilters}>
            Clear
          </button>
          <button type="button" className="button button-primary" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </section>

      {error && <p className="status-error">{error}</p>}

      {/* PROPERTIES LIST */}
      {loading ? (
        <div className="grid">
          <div className="loading-block" />
          <div className="loading-block" />
          <div className="loading-block" />
          <div className="loading-block" />
        </div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>No properties match your search</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
            Try adjusting your search location or clearing active price filters.
          </p>
          <button type="button" className="button button-outline" onClick={clearFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid">
          {properties.map((p, index) => {
            const fallbackImages = [
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            ];
            const imgSrc = p.image
              ? getImageSrc(p.image)
              : p.images && p.images.length > 0
              ? getImageSrc(p.images[0])
              : fallbackImages[index % fallbackImages.length];

            const displayRating = p.rating || (4.8 + ((index * 3) % 20) / 100).toFixed(2);
            const isSuperhost = p.isSuperhost !== undefined ? p.isSuperhost : index % 2 === 0;

            return (
              <div
                key={p._id || index}
                onClick={() => navigate(`/properties/${p._id}`)}
                className="property-card"
              >
                <div className="property-card-media">
                  <img
                    src={imgSrc}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImages[index % fallbackImages.length];
                    }}
                    alt={p.title}
                    loading="lazy"
                  />
                  {isSuperhost && (
                    <span className="badge-tag">Superhost</span>
                  )}
                  <span className="rating-badge">
                    <span className="star-icon">★</span>
                    <span>{displayRating}</span>
                  </span>
                </div>
                <div className="property-card-body">
                  <h3 className="property-title" title={p.title}>
                    {p.title}
                  </h3>
                  <p className="property-location">
                    <span>{p.location}</span>
                  </p>
                  <div className="property-card-footer">
                    <p className="price">
                      ₹{Number(p.pricePerNight).toLocaleString("en-IN")}{" "}
                      <span className="price-unit">/ night</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Properties;
