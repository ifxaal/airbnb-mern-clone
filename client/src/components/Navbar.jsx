import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav
  style={{
    padding: "20px 40px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 1000
  }}
>


      <Link to="/" style={{ fontWeight: "bold", fontSize: "20px" }}>
  airbnb
</Link>


      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>

        <Link to="/" style={{ 
  fontWeight: "bold", 
  fontSize: "20px",
  color: "#ff385c",
  textDecoration: "none"
}}>
  StayFinder
</Link>



        {isLoggedIn ? (
          <>
            <Link to="/my-properties">My Properties</Link>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/create">List Property</Link>

            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
