import { useEffect, useState } from "react";
import api from "../api/axios";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");


  useEffect(() => {
    setLoading(true);

    api
      .get("/properties", {
        params: {
          location,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sortOrder,
        },
      })
      .then((res) => {
        setProperties(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location, minPrice, maxPrice, sortOrder]);

  if (loading) return <p>Loading...</p>;

  return (
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px" }}>

      <input
        type="text"
        placeholder="Search by location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "20px" }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ padding: "8px", width: "120px" }}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: "8px", width: "120px" }}
        />
      </div>

      {properties.length === 0 && (
        <p>No properties found.</p>
      )}

      <select
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
  style={{
    padding: "8px",
    marginBottom: "20px",
  }}
>
  <option value="">Sort by</option>
  <option value="low">Price: Low to High</option>
  <option value="high">Price: High to Low</option>
</select>


      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",

          gap: "20px",
        }}
      >
        {properties.map((p) => (
          <div
            key={p._id}
            onClick={() => (window.location.href = `/properties/${p._id}`)}
            style={{
  borderRadius: "16px",
  overflow: "hidden",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  background: "#fff",
  transition: "0.3s"
}}


onMouseOver={(e) =>
  (e.currentTarget.style.boxShadow =
    "0 8px 20px rgba(0,0,0,0.1)")
}
onMouseOut={(e) =>
  (e.currentTarget.style.boxShadow = "none")
}
          >
            <img
  src={
    p.image
      ? `http://localhost:5000${p.image}`
      : p.images && p.images.length > 0
      ? p.images[0]
      : "https://picsum.photos/400/300"
  }
  alt={p.title}
  style={{
  width: "100%",
  height: "250px",
  objectFit: "cover"
}}

/>
 <div style={{ padding: "14px" }}>
  <h3 style={{ margin: "0 0 6px" }}>{p.title}</h3>
  <p style={{ margin: 0, color: "#717171" }}>{p.location}</p>
  <p style={{ marginTop: "8px", fontWeight: "bold" }}>
    ₹{p.pricePerNight} / night
  </p>
</div>

            
          </div>
        ))}
      </div>
    </div>
  );
}

export default Properties;
