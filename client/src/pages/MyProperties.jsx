import { useEffect, useState } from "react";
import api from "../api/axios";

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleDelete = async (id) => {
  if (!window.confirm("Delete property?")) return;

  await api.delete(`/properties/${id}`);
  setProperties(properties.filter((p) => p._id !== id));
};


  useEffect(() => {
    api
      .get("/properties/my")
      .then((res) => {
        setProperties(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Properties</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {properties.map((p) => (
          <div
            key={p._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
            }}
          >
            <img
  src={
    p.image
      ? p.image.startsWith("http")
        ? p.image
        : `http://localhost:5000${p.image}`
      : p.images && p.images.length > 0
        ? p.images[0]
        : "/images/house2.jpg"
  }
  alt={p.title}
  style={{
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px 10px 0 0",
  }}
/>




            <div style={{ padding: "12px" }}>
              <h3>{p.title}</h3>
              <p>{p.location}</p>
              <p style={{ fontWeight: "bold" }}>
                ₹{p.pricePerNight} / night
              </p>
            </div>
            
            <button onClick={() => handleDelete(p._id)}>
  Delete
  
</button>


          </div>
        ))}
      </div>
    </div>
    
  );
}

export default MyProperties;
